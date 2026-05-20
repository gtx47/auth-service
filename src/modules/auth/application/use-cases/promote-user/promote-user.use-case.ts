import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ADMIN_PROMOTE_SECRET,
  OUTBOX_REPOSITORY,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { OutboxEvent } from '../../../domain/entities/outbox-event.entity';
import { OutboxRepositoryPort } from '../../../domain/ports/outbox.repository.port';
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
    @Inject(OUTBOX_REPOSITORY) private readonly outboxRepository: OutboxRepositoryPort,
  ) {}

  async execute(command: PromoteUserCommand): Promise<PublicUser> {
    const { email, secret } = command;

    if (!this.adminSecret) {
      throw new InternalServerErrorException('ADMIN_PROMOTE_SECRET no configurado');
    }

    if (secret !== this.adminSecret) {
      throw new BadRequestException('Secreto inválido');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const updated = await this.userRepository.updateRole(normalizedEmail, 'admin');
    const publicUser = updated.toPublicJSON();

    await this.outboxRepository.save(
      new OutboxEvent({
        type: 'user.role-changed',
        payload: {
          id: publicUser.id,
          name: publicUser.name,
          email: publicUser.email,
          role: publicUser.role,
        },
      }),
    );

    return publicUser;
  }
}
