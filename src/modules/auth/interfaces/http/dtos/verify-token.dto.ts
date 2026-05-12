import { IsString, MinLength } from 'class-validator';

export class VerifyTokenDto {
  @IsString({ message: 'Token requerido' })
  @MinLength(1, { message: 'Token requerido' })
  token!: string;
}
