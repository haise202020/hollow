const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/** Strip control characters and normalize whitespace. */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";

  return input
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Escape HTML entities to prevent XSS when rendering untrusted text. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
}

/** Allow only safe usernames (Roblox-style). */
export function sanitizeUsername(input: unknown): string {
  const value = sanitizeText(input, 20);
  return value.replace(/[^a-zA-Z0-9_]/g, "");
}

/** Allow only digits for amounts / package ids. */
export function sanitizeDigits(input: unknown, maxLength = 12): string {
  if (typeof input !== "string" && typeof input !== "number") return "";
  return String(input)
    .replace(/\D/g, "")
    .slice(0, maxLength);
}
