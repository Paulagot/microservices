// shared/queue/messageQueue.ts

import amqp, { Channel, Connection } from "amqplib";
import { RABBITMQ_CONFIG } from "./config";
import { QueueMessage } from "./types";

/**
 * Message queue class to handle RabbitMQ connections, publishing, and consuming messages.
 */
export class CardanoMessageQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  /**
   * Establish a connection to RabbitMQ and set up queues.
   */
  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(RABBITMQ_CONFIG.url);
      this.channel = await this.connection.createChannel();
      
      // Declare an exchange (direct type allows specific routing keys)
      await this.channel.assertExchange(RABBITMQ_CONFIG.exchange, "direct", { durable: true });
      
      // Declare queues
      await this.channel.assertQueue(RABBITMQ_CONFIG.queues.balance, { durable: true });
      await this.channel.assertQueue(RABBITMQ_CONFIG.queues.token, { durable: true });
      
      // Bind queues to exchange with routing keys
      await this.channel.bindQueue(RABBITMQ_CONFIG.queues.balance, RABBITMQ_CONFIG.exchange, "balance");
      await this.channel.bindQueue(RABBITMQ_CONFIG.queues.token, RABBITMQ_CONFIG.exchange, "token");
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  /**
   * Publish a message to a specific queue.
   */
  async publish<T>(routingKey: string, message: QueueMessage<T>): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized");
    }
    try {
      await this.channel.publish(
        RABBITMQ_CONFIG.exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      console.error("Error publishing message:", error);
      throw error;
    }
  }

  /**
   * Consume messages from a queue and process them using a callback function.
   */
  async consume(queue: string, callback: (message: QueueMessage<any>) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized");
    }
    try {
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString()) as QueueMessage<any>;
          await callback(content);
          this.channel?.ack(msg); // Acknowledge message to remove it from the queue
        }
      });
    } catch (error) {
      console.error("Error consuming message:", error);
      throw error;
    }
  }

  /**
   * Close RabbitMQ connection and channel.
   */
  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.error("Error closing connections:", error);
      throw error;
    }
  }
}

