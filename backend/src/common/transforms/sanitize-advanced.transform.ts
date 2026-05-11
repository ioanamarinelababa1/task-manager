import { Transform } from 'class-transformer';

export function SanitizeAdvanced() {
  return Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    return value
      .trim() // remove leading/trailing whitespace
      .replace(/\0/g, '') // remove null bytes (binary injection)
      .normalize('NFC'); // unicode normalization (prevent lookalike chars)
  });
}
