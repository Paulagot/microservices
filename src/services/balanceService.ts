// services/balanceService.ts

import { CardanoMessageQueue } from "../shared/queue/messageQueue";
import { RABBITMQ_CONFIG } from "../shared/queue/config";
import type { QueueMessage, BalanceUpdate, TokenUpdate } from "../shared/queue/types";
import { CardanoBalance } from '../types/cardanoTypes';

/**
 * BalanceService handles messages related to balance updates using RabbitMQ.
 */
export class BalanceService {
  private messageQueue: CardanoMessageQueue;

  constructor() {
    this.messageQueue = new CardanoMessageQueue();
  }

  /**
   * Initialize message queue connection and start listening for messages.
   */
  async init(): Promise<void> {
    await this.messageQueue.connect();
    await this.setupConsumers();
  }

  /**
   * Set up consumers to process incoming balance-related messages.
   */
  private async setupConsumers(): Promise<void> {
    await this.messageQueue.consume(
      RABBITMQ_CONFIG.queues.balance,
      async (message: QueueMessage<TokenUpdate>) => {
        if (message.type === "TOKEN_UPDATE") {
          await this.handleTokenUpdate(message.data);
        }
      }
    );
  }

  /**
   * Process token update messages received from the queue.
   */
  private async handleTokenUpdate(update: TokenUpdate): Promise<void> {
    console.log("Balance service received token update for address:", update.address);
    // Implement balance update logic here
  }

  /**
   * Publish balance update messages to the queue.
   */
  async updateBalance(address: string, balances: CardanoBalance[]): Promise<void> {
    const message: QueueMessage<BalanceUpdate> = {
      type: 'BALANCE_UPDATE',
      data: { address, balances },
      timestamp: new Date()
    };
    console.log('Balance service publishing message:', JSON.stringify(message, null, 2));
    await this.messageQueue.publish('token', message);
  }
}

