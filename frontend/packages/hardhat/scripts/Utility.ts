export function validateInput(input: string): boolean {
  return typeof input === "string" && input.trim() !== "";
}
