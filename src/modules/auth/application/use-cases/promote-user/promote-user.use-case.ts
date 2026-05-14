import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ADMIN_PROMOTE_SECRET,
  EVENT_PUBLISHER,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { PublicUser } from '../../../domain/entities/user.entity';
import { EventPublisherPort } from '../../../domain/ports/event-publisher.port';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface PromoteUserCommand {
  email: string;
  secret: string;
}

@Injectable()
export class PromoteUserUseCase {
  private readonly logger = new Logger('PromoteUserUseCase');

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(ADMIN_PROMOTE_SECRET) private readonly adminSecret: string,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisherPort,
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

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const updated = await this.userRepository.updateRole(
      normalizedEmail,
      'admin',
    );
    const publicUser = updated.toPublicJSON();

    try {
      await this.eventPublisher.publish({
        type: 'user.role-changed',
        payload: {
          id: publicUser.id,
          name: publicUser.name,
          email: publicUser.email,
          role: publicUser.role,
        },
      });
    } catch (err) {
      this.logger.warn(
        `no se pudo publicar user.role-changed: ${(err as Error).message}`,
      );
    }

    return publicUser;
  }
}
