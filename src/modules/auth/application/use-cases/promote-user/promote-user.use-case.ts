import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ADMIN_PROMOTE_SECRET,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { PublicUser } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface PromoteUserCommand {
  email: string;
  secret: string;
}

@Injectable()
export class PromoteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(ADMIN_PROMOTE_SECRET) private readonly adminSecret: string,
  ) {}

  async execute(command: PromoteUserCommand): Promise<PublicUser> {
    const { email, secret } = command;

    if (!this.adminSecret) {
      throw new InternalServerErrorException(
        'ADMIN_PROMOTE_SECRET no configurado',
      );
    }

    if (secret !== this.adminSecret) {
      throw new BadRequestException('Secreto inválido');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const updated = await this.userRepository.updateRole(email, 'admin');
    return updated.toPublicJSON();
  }
}
