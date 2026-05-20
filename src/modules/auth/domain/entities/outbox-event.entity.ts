import { v4 as uuidv4 } from 'uuid';

export interface OutboxEventProps {
  id?: string | null;
  eventId?: string;
  type: string;
  payload: Record<string, unknown>;
  publishedAt?: Date | null;
  createdAt?: Date | null;
}

export class OutboxEvent {
  public readonly id: string | null;
  public readonly eventId: string;
  public readonly type: string;
  public readonly payload: Record<string, unknown>;
  public publishedAt: Date | null;
  public readonly createdAt: Date | null;

  constructor(props: OutboxEventProps) {
    const { id, eventId, type, payload, publishedAt = null, createdAt = null } = props;
    if (!type || type.trim().length === 0) throw new Error('OutboxEvent: type requerido');
    if (!payload || typeof payload !== 'object') throw new Error('OutboxEvent: payload requerido');
    this.id = id ?? null;
    this.eventId = eventId ?? uuidv4();
    this.type = type;
    this.payload = payload;
    this.publishedAt = publishedAt;
    this.createdAt = createdAt;
  }

  isPublished(): boolean {
    return this.publishedAt !== null;
  }

  markPublished(): void {
    this.publishedAt = new Date();
  }
}
