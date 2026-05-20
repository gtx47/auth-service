import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxEvent } from '../../domain/entities/outbox-event.entity';
import { OutboxRepositoryPort } from '../../domain/ports/outbox.repository.port';
import { OUTBOX_MODEL_NAME, OutboxDocument, OutboxMongo } from './outbox.schema';

@Injectable()
export class MongoOutboxRepository implements OutboxRepositoryPort {
  constructor(
    @InjectModel(OUTBOX_MODEL_NAME)
    private readonly outboxModel: Model<OutboxMongo>,
  ) {}

  async save(event: OutboxEvent): Promise<OutboxEvent> {
    const created = await this.outboxModel.create({
      eventId: event.eventId,
      type: event.type,
      payload: event.payload,
      publishedAt: event.publishedAt,
    });
    return this.toDomain(created);
  }

  async findUnpublished(limit: number): Promise<OutboxEvent[]> {
    const docs = await this.outboxModel
      .find({ publishedAt: null })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
    return docs.map((d) => this.toDomain(d));
  }

  async markPublished(eventId: string): Promise<void> {
    await this.outboxModel
      .updateOne({ eventId }, { $set: { publishedAt: new Date() } })
      .exec();
  }

  private toDomain(doc: OutboxDocument): OutboxEvent {
    return new OutboxEvent({
      id: doc._id.toString(),
      eventId: doc.eventId,
      type: doc.type,
      payload: doc.payload,
      publishedAt: doc.publishedAt,
      createdAt: doc.createdAt ?? null,
    });
  }
}
