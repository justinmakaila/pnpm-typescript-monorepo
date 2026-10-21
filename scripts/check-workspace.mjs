import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(here, '..');
const workspaceDirectories = ['apps', 'packages'];
const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.js', '.mjs']);

function readJson(filename) {
  return JSON.parse(readFileSync(filename, 'utf8'));
}

function filesWithin(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesWithin(fullPath);
    return entry.isFile() && sourceExtensions.has(path.extname(fullPath)) ? [fullPath] : [];
  });
}

function moduleSpecifiers(filename) {
  const source = readFileSync(filename, 'utf8');
  const kind = filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, kind);
  const result = [];
  const add = (node) => {
    if (node && ts.isStringLiteralLike(node)) result.push(node.text);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      add(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      add(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')
      ) {
        add(node.arguments[0]);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return result;
}

function checkExports(manifest, label, errors) {
  if (!manifest.exports || !manifest.exports['.']) {
    errors.push(`${label}: packages must expose an explicit public '.' export`);
    return;
  }
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (subpath !== '.' && !/^\.\/[a-z0-9][a-z0-9_/-]*$/.test(subpath)) {
      errors.push(`${label}: invalid or wildcard export ${subpath}`);
    }
    if (
      !target ||
      typeof target !== 'object' ||
      Array.isArray(target) ||
      typeof target.types !== 'string' ||
      typeof target.import !== 'string' ||
      !target.import.startsWith('./dist/') ||
      !target.import.endsWith('.js') ||
      !target.types.startsWith('./dist/') ||
      !target.types.endsWith('.d.ts')
    ) {
      errors.push(`${label}: export ${subpath} must provide dist-only types and ESM import paths`);
    }
  }
}

/** Return actionable policy failures without mutating the workspace. */
export function checkWorkspace(root = repositoryRoot) {
  const errors = [];
  const membership = readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
  for (const directory of workspaceDirectories) {
    if (!new RegExp(`['"]?${directory}/\\*['"]?`).test(membership)) {
      errors.push(`pnpm-workspace.yaml must include ${directory}/*`);
    }
  }
  const entries = [];
  for (const kind of workspaceDirectories) {
    const parent = path.join(root, kind);
    if (!existsSync(parent)) {
      errors.push(`Missing workspace directory ${kind}/`);
      continue;
    }
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const directory = path.join(parent, entry.name);
      const manifestPath = path.join(directory, 'package.json');
      if (!existsSync(manifestPath)) {
        errors.push(`${kind}/${entry.name}: missing package.json`);
        continue;
      }
      const manifest = readJson(manifestPath);
      const label = `${kind}/${entry.name}`;
      entries.push({ directory, label, manifest, kind });
      if (manifest.type !== 'module') errors.push(`${label}: type must be module`);
      if (manifest.private !== true) errors.push(`${label}: template workspaces must be private`);
      if (typeof manifest.name !== 'string' || !manifest.name) {
        errors.push(`${label}: a unique package name is required`);
      }
      for (const script of ['build', 'lint', 'typecheck', 'test']) {
        if (!manifest.scripts?.[script]) errors.push(`${label}: missing ${script} script`);
      }
      if (kind === 'packages') checkExports(manifest, label, errors);
      if (kind === 'apps' && manifest.exports)
        errors.push(`${label}: applications cannot expose package exports`);
    }
  }
  const named = new Map();
  for (const entry of entries) {
    const name = entry.manifest.name;
    if (named.has(name)) errors.push(`${entry.label}: duplicate package name ${name}`);
    else named.set(name, entry);
  }
  const scopes = new Set(
    entries.map(({ manifest }) => manifest.name?.split('/')[0]).filter(Boolean),
  );

  for (const entry of entries) {
    const { directory, label, manifest, kind } = entry;
    const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
    for (const [name, version] of Object.entries(dependencies)) {
      const local = named.get(name);
      if (local && version !== 'workspace:*') {
        errors.push(`${label}: ${name} must use workspace:*`);
      }
      if (local && (local.kind === 'apps' || (kind === 'packages' && local.kind !== 'packages'))) {
        errors.push(`${label}: workspace dependencies cannot point to applications (${name})`);
      }
      if (typeof version === 'string' && version.startsWith('workspace:') && !local) {
        errors.push(`${label}: missing workspace package ${name}`);
      }
    }
    const ownExports = Object.keys(manifest.exports ?? {}).map((key) =>
      key === '.' ? manifest.name : `${manifest.name}/${key.slice(2)}`,
    );
    for (const filename of [
      ...filesWithin(path.join(directory, 'src')),
      ...filesWithin(path.join(directory, 'test')),
    ]) {
      const relativeName = path.relative(root, filename).split(path.sep).join('/');
      for (const specifier of moduleSpecifiers(filename)) {
        if (specifier.startsWith('.')) {
          const targetPath = path.resolve(path.dirname(filename), specifier);
          for (const other of entries) {
            if (other === entry) continue;
            if (
              targetPath === other.directory ||
              targetPath.startsWith(`${other.directory}${path.sep}`)
            ) {
              errors.push(
                `${relativeName}: relative import crosses workspace boundary: ${specifier}`,
              );
            }
          }
          continue;
        }
        if (specifier.startsWith('node:')) continue;
        const target = entries.find(
          ({ manifest: candidate }) =>
            specifier === candidate.name || specifier.startsWith(`${candidate.name}/`),
        );
        if (target) {
          if (target === entry && ownExports.includes(specifier)) continue;
          if (target.kind === 'apps') {
            errors.push(`${relativeName}: cannot import application ${target.manifest.name}`);
          } else if (!Object.hasOwn(dependencies, target.manifest.name)) {
            errors.push(`${relativeName}: declare workspace dependency ${target.manifest.name}`);
          } else if (
            !Object.keys(target.manifest.exports ?? {}).some(
              (key) =>
                specifier ===
                (key === '.' ? target.manifest.name : `${target.manifest.name}/${key.slice(2)}`),
            )
          ) {
            errors.push(`${relativeName}: import '${specifier}' is not a public export`);
          }
        } else if ([...scopes].some((scope) => specifier.startsWith(`${scope}/`))) {
          errors.push(`${relativeName}: unknown workspace package ${specifier}`);
        } else if (
          !Object.hasOwn(
            dependencies,
            specifier
              .split('/')
              .slice(0, specifier.startsWith('@') ? 2 : 1)
              .join('/'),
          ) &&
          !specifier.startsWith('node:')
        ) {
          errors.push(`${relativeName}: missing declared dependency for '${specifier}'`);
        }
      }
    }
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkWorkspace();
  if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.info('Workspace policy OK');
  }
}
