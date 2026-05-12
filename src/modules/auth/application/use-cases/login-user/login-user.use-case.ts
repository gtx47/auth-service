import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  HASHER,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { PublicUser } from '../../../domain/entities/user.entity';
import { HasherPort } from '../../../domain/ports/hasher.port';
import { TokenServicePort } from '../../../domain/ports/token-service.port';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface LoginUserResult {
  token: string;
  user: PublicUser;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(HASHER) private readonly hasher: HasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    const { email, password } = command;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: user.toPublicJSON() };
  }
}
