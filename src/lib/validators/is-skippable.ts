export function isSkippable(char: string): boolean {
  return /\s/.test(char);
}