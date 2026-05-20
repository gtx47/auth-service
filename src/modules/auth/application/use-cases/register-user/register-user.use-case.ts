import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  HASHER,
  OUTBOX_REPOSITORY,
  USER_REPOSITORY,
} from '../../../auth.tokens';
import { OutboxEvent } from '../../../domain/entities/outbox-event.entity';
import { OutboxRepositoryPort } from '../../../domain/ports/outbox.repository.port';
import { PublicUser, User } from '../../../domain/entities/user.entity';
import { HasherPort } from '../../../domain/ports/hasher.port';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

export interface RegisterUserCommand {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(HASHER) private readonly hasher: HasherPort,
    @Inject(OUTBOX_REPOSITORY) private readonly outboxRepository: OutboxRepositoryPort,
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

    await this.outboxRepository.save(
      new OutboxEvent({
        type: 'user.registered',
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
