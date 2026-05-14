import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  EVENT_PUBLISHER,
  HASHER,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { PublicUser, User } from '../../../domain/entities/user.entity';
import { EventPublisherPort } from '../../../domain/ports/event-publisher.port';
import { HasherPort } from '../../../domain/ports/hasher.port';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface RegisterUserCommand {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger('RegisterUserUseCase');

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(HASHER) private readonly hasher: HasherPort,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<PublicUser> {
    const { name, email, password } = command;

    if (!password || password.length < 6) {
      throw new BadRequestException('Password mínimo 6 caracteres');
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email ya registrado');
    }

    const passwordHash = await this.hasher.hash(password);

    let user: User;
    try {
      user = new User({ name, email, passwordHash, role: 'customer' });
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    const saved = await this.userRepository.save(user);
    const publicUser = saved.toPublicJSON();

    try {
      await this.eventPublisher.publish({
        type: 'user.registered',
        payload: {
          id: publicUser.id,
          name: publicUser.name,
          email: publicUser.email,
          role: publicUser.role,
        },
      });
    } catch (err) {
      this.logger.warn(
        `no se pudo publicar user.registered: ${(err as Error).message}`,
      );
    }

    return publicUser;
  }
}
