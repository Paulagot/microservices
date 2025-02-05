// services/tokenService.ts

import { CardanoMessageQueue } from "../shared/queue/messageQueue";
import { RABBITMQ_CONFIG } from "../shared/queue/config";
import type { QueueMessage, BalanceUpdate, TokenUpdate } from "../shared/queue/types";
import type { TokenData } from "../types/cardanoTypes";

/**
 * TokenService handles messages related to token updates using RabbitMQ.
 */
export class TokenService {
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
   * Set up consumers to process incoming token-related messages.
   */
  private async setupConsumers(): Promise<void> {
    await this.messageQueue.consume(
      RABBITMQ_CONFIG.queues.token,
      async (message: QueueMessage<unknown>) => {
        if (message.type === "balance") {
          await this.handleBalanceUpdate(message.data as BalanceUpdate);
        }
      }
    );
  }

  /**
   * Process balance update messages received from the queue.
   */
  private async handleBalanceUpdate(update: BalanceUpdate): Promise<void> {
    console.log("Token service received balance update for address:", update.address);
    // Implement token update logic here
  }

  /**
   * Publish token update messages to the queue.
   */
  async updateTokens(address: string, tokens: TokenData[]): Promise<void> {
    const message: QueueMessage<TokenUpdate> = {
      type: 'token',
      walletAddress: address,
      data: { 
        address, 
        tokens 
      },
      timestamp: new Date()
    };
    console.log('Token service publishing message:', JSON.stringify(message, null, 2));
    await this.messageQueue.publish('token', message);
  }
}
