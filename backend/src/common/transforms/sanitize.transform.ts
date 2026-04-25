import sanitizeHtml from 'sanitize-html';
import { Transform } from 'class-transformer';

export function SanitizeHtml() {
  return Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  });
}
