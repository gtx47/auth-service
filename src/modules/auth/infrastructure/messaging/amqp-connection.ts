import { Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

export const DOMAIN_EVENTS_EXCHANGE = 'domain-events';

const log = new Logger('AmqpConnection');

export type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

export async function connectWithRetry(
  url: string,
  attempts = 30,
  delayMs = 2000,
): Promise<AmqpConnection> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const connection = await amqp.connect(url);
      log.log(`connected to ${url} (attempt ${i})`);
      return connection;
    } catch (err) {
      lastError = err;
      log.warn(
        `connect attempt ${i}/${attempts} failed (${(err as Error).message}); retrying in ${delayMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('amqp connect failed');
}
