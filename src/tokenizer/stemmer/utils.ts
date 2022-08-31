export function buildFullWordRegex(partialRe: string): RegExp {
  const initialPattern = "^(.+?)";
  const endingPattern = "$";
  return new RegExp(initialPattern + partialRe + endingPattern);
}
