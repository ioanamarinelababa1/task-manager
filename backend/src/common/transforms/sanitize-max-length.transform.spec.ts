import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { SanitizeMaxLength } from './sanitize-max-length.transform';

class TestDto {
  @SanitizeMaxLength(10)
  field!: string;
}

class NonStringDto {
  @SanitizeMaxLength(5)
  field!: unknown;
}

const transform = (value: unknown): unknown =>
  plainToInstance(TestDto, { field: value }).field;

const transformNonString = (value: unknown): unknown =>
  plainToInstance(NonStringDto, { field: value }).field;

describe('SanitizeMaxLength', () => {
  it('returns value unchanged when length is within limit', () => {
    expect(transform('hello')).toBe('hello');
    expect(transform('1234567890')).toBe('1234567890');
  });

  it('truncates string to maxLength when it exceeds the limit', () => {
    expect(transform('12345678901')).toBe('1234567890');
    expect(transform('a'.repeat(100))).toBe('a'.repeat(10));
  });

  it('handles empty string', () => {
    expect(transform('')).toBe('');
  });

  it('passes through non-string values unchanged', () => {
    expect(transformNonString(42)).toBe(42);
    expect(transformNonString(null)).toBeNull();
    expect(transformNonString(undefined)).toBeUndefined();
    expect(transformNonString(true)).toBe(true);
  });
});
