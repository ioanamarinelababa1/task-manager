import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
}
