---
name: boundary-review
description: Use when evaluating package seams, application ownership, or proposed architectural extraction.
---

# Boundary review

**Input:** Current implementation or proposed package split and concrete consumer paths.

1. Read `docs/architecture.md` and the relevant manifests/exports.
2. Trace callers, persistence/transport lifetimes, and direct dependency direction.
3. Compare actual present responsibilities with proposed future ones; don't elevate
   unmerged plans to shipped architecture.
4. Check enforcement with `pnpm check:workspace` and small failing fixtures as needed.
5. Recommend preserve, consolidate, extract or remove. State the responsibility each
   retained boundary protects and identify any redundant wrappers or configuration.

**Output:** Evidence, tradeoffs and smallest actionable changes, not generic DDD layers.
