import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import {
  DomainEvent,
  EventPublisherPort,
} from '../../domain/ports/event-publisher.port';
import {
  AmqpConnection,
  connectWithRetry,
  DOMAIN_EVENTS_EXCHANGE,
} from './amqp-connection';

@Injectable()
export class RabbitMQEventPublisher
  implements EventPublisherPort, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('RabbitMQPublisher');
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const url = this.config.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn(
        'RABBITMQ_URL no configurado; los eventos no se publicarán',
      );
      return;
    }
    try {
      const connection = await connectWithRetry(url);
      this.connection = connection;
      const channel = await connection.createChannel();
      this.channel = channel;
      await channel.assertExchange(DOMAIN_EVENTS_EXCHANGE, 'topic', {
        durable: true,
      });
      this.logger.log(`publisher ready (exchange ${DOMAIN_EVENTS_EXCHANGE})`);
    } catch (err) {
      this.logger.error(
        `no se pudo conectar a RabbitMQ: ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
    } catch (err) {
      this.logger.warn(`channel close: ${(err as Error).message}`);
    }
    try {
      if (this.connection) await this.connection.close();
    } catch (err) {
      this.logger.warn(`connection close: ${(err as Error).message}`);
    }
    this.channel = null;
    this.connection = null;
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `evento ${event.type} no publicado (sin canal RabbitMQ)`,
      );
      return;
    }
    const eventId = event.eventId ?? uuidv4();
    const body = Buffer.from(JSON.stringify(event.payload));
    this.channel.publish(DOMAIN_EVENTS_EXCHANGE, event.type, body, {
      persistent: true,
      messageId: eventId,
      contentType: 'application/json',
      type: event.type,
    });
  }
}
