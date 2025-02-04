//shared/queue/config.ts

export const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: 'cardano_exchange',
  queues: {
    balance: 'balance_queue',
    token: 'token_queue'
  }
};
