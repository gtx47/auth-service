import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OutboxDocument = HydratedDocument<OutboxMongo>;

@Schema({
  collection: 'outboxevents',
  timestamps: { createdAt: true, updatedAt: false },
})
export class OutboxMongo {
  @Prop({ type: String, required: true, unique: true, index: true })
  eventId!: string;

  @Prop({ type: String, required: true })
  type!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  createdAt?: Date;
}

export const OutboxSchema = SchemaFactory.createForClass(OutboxMongo);
export const OUTBOX_MODEL_NAME = 'AuthOutboxEvent';
