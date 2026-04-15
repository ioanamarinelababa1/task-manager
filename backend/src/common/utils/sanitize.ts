/**
 * Trims whitespace and strips HTML tags from string inputs.
 * Used via @Transform in DTOs as a defence-in-depth measure against
 * stored XSS — the real XSS boundary is the frontend, but we never
 * persist raw HTML in the database.
 */
export function sanitizeString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/<[^>]*>/g, '');
}
