import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { OUTBOX_REPOSITORY, EVENT_PUBLISHER } from '../../auth.tokens';
import { EventPublisherPort } from '../../domain/ports/event-publisher.port';
import { OutboxRepositoryPort } from '../../domain/ports/outbox.repository.port';

const POLL_INTERVAL_MS = 1000;
const BATCH_SIZE = 50;

@Injectable()
export class OutboxRelay implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('AuthOutboxRelay');
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: OutboxRepositoryPort,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisherPort,
  ) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, POLL_INTERVAL_MS);
    this.logger.log(`polling started (${POLL_INTERVAL_MS}ms)`);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const events = await this.outboxRepository.findUnpublished(BATCH_SIZE);
      for (const event of events) {
        try {
          await this.publisher.publish({
            eventId: event.eventId,
            type: event.type,
            payload: event.payload,
          });
          await this.outboxRepository.markPublished(event.eventId);
        } catch (err) {
          this.logger.error(
            `publish failed for ${event.eventId} (${event.type}): ${(err as Error).message}`,
          );
          break;
        }
      }
    } catch (err) {
      this.logger.error(`tick failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
