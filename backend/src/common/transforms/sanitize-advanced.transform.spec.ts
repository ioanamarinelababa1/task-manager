import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { SanitizeAdvanced } from './sanitize-advanced.transform';

class TestDto {
  @SanitizeAdvanced()
  field!: string;
}

class AnyDto {
  @SanitizeAdvanced()
  field!: unknown;
}

const transform = (value: unknown): unknown =>
  plainToInstance(TestDto, { field: value }).field;

const transformAny = (value: unknown): unknown =>
  plainToInstance(AnyDto, { field: value }).field;

describe('SanitizeAdvanced', () => {
  it('trims leading and trailing whitespace', () => {
    expect(transform('  hello  ')).toBe('hello');
  });

  it('removes null bytes', () => {
    expect(transform('hel\0lo')).toBe('hello');
  });

  it('strips control characters', () => {
    expect(transform('hel\u0001lo')).toBe('hello');
    expect(transform('tab\there')).toBe('tabhere');
    expect(transform('del\u007Fchar')).toBe('delchar');
  });

  it('strips zero-width characters', () => {
    expect(transform('hel\u200Blo')).toBe('hello');
    expect(transform('hel\u200Clo')).toBe('hello');
    expect(transform('hel\u200Dlo')).toBe('hello');
    expect(transform('hel\uFEFFlo')).toBe('hello');
  });

  it('collapses multiple spaces into one', () => {
    expect(transform('hello   world')).toBe('hello world');
    expect(transform('a  b  c')).toBe('a b c');
  });

  it('applies NFC unicode normalization', () => {
    const decomposed = 'e\u0301'; // e + combining acute accent
    const composed = '\u00E9'; // é precomposed
    expect(transform(decomposed)).toBe(composed);
  });

  it('passes through non-string values unchanged', () => {
    expect(transformAny(42)).toBe(42);
    expect(transformAny(null)).toBeNull();
    expect(transformAny(undefined)).toBeUndefined();
    expect(transformAny(true)).toBe(true);
  });

  it('handles empty string', () => {
    expect(transform('')).toBe('');
  });
});
