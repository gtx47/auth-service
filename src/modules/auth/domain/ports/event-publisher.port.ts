export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  eventId?: string;
}

export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
}
