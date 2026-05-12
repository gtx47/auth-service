import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString({ message: 'Password requerido' })
  @MinLength(1, { message: 'Password requerido' })
  password!: string;
}
