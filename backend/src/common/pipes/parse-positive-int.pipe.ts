import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * Parses a route parameter as an integer and rejects values that are
 * not valid positive integers (NaN, 0, negative, floats passed as strings).
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform {
  transform(value: string): number {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0 || String(num) !== value) {
      throw new BadRequestException(`ID must be a positive integer`);
    }
    return num;
  }
}
