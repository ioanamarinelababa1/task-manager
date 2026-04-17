import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address — normalised to lowercase',
  })
  // Normalise email to lowercase so User@EXAMPLE.COM and user@example.com are the same identity
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'Secret1234',
    description:
      'Password — min 8 chars, must include uppercase, lowercase, and a digit',
  })
  // Password policy: 8+ chars, upper, lower, digit — enforced here and mirrored on the frontend
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password: string;
}
