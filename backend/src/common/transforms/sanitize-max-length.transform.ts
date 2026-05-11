import { Transform } from 'class-transformer';

export function SanitizeMaxLength(maxLength: number) {
  return Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  });
}
