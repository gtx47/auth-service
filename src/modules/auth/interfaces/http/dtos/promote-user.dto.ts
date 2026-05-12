import { IsEmail, IsString, MinLength } from 'class-validator';

export class PromoteUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString({ message: 'Secret requerido' })
  @MinLength(1, { message: 'Secret requerido' })
  secret!: string;
}
