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
import { EventPublisherPort } from '../../../domain/ports/event-publisher.port';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface ResyncUsersCommand {
  secret: string;
}

export interface ResyncUsersResult {
  published: number;
}

@Injectable()
export class ResyncUsersUseCase {
  private readonly logger = new Logger('ResyncUsersUseCase');

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(ADMIN_PROMOTE_SECRET) private readonly adminSecret: string,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(command: ResyncUsersCommand): Promise<ResyncUsersResult> {
    if (!this.adminSecret) {
      throw new InternalServerErrorException(
        'ADMIN_PROMOTE_SECRET no configurado',
      );
    }
    if (command.secret !== this.adminSecret) {
      throw new BadRequestException('Secreto inválido');
    }

    const users = await this.userRepository.findAll();
    let published = 0;
    for (const user of users) {
      try {
        await this.eventPublisher.publish({
          type: 'user.registered',
          payload: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
        published++;
      } catch (err) {
        this.logger.warn(
          `no se pudo republicar ${user.email}: ${(err as Error).message}`,
        );
      }
    }
    this.logger.log(`republicados ${published}/${users.length} usuarios`);
    return { published };
  }
}
