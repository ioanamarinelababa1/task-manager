import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'Secret1234', description: 'Account password' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
}
