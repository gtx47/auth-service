import { OutboxEvent } from '../entities/outbox-event.entity';

export interface OutboxRepositoryPort {
  save(event: OutboxEvent): Promise<OutboxEvent>;
  findUnpublished(limit: number): Promise<OutboxEvent[]>;
  markPublished(eventId: string): Promise<void>;
}
