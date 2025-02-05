// shared/queue/config.ts
export const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: 'cardano_exchange',
  queues: {
    balance: 'balance_queue',
    token: 'token_queue'
  }
} as const;

export type QueueNames = typeof RABBITMQ_CONFIG.queues[keyof typeof RABBITMQ_CONFIG.queues];
export type RoutingKeys = 'balance' | 'token';
