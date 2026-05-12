import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'Nombre inválido' })
  @MinLength(2, { message: 'Nombre inválido' })
  name!: string;

  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString({ message: 'Password mínimo 6 caracteres' })
  @MinLength(6, { message: 'Password mínimo 6 caracteres' })
  password!: string;
}
