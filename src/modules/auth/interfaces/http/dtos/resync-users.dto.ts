import { IsString, MinLength } from 'class-validator';

export class ResyncUsersDto {
  @IsString()
  @MinLength(1)
  secret!: string;
}
