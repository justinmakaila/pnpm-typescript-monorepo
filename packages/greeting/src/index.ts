/** Options accepted by the greeting capability. */
export interface GreetingOptions {
  readonly name: string;
}

/** Construct a friendly greeting without application or transport dependencies. */
export function greet({ name }: GreetingOptions): string {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error('A non-empty name is required');
  }
  return `Hello, ${normalized}!`;
}
