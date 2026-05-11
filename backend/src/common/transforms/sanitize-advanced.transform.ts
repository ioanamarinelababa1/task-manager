import { Transform } from 'class-transformer';

export function SanitizeAdvanced() {
  return Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    return (
      value
        .trim()
        .replace(/\0/g, '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .normalize('NFC')
    );
  });
}
