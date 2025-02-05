// shared/queue/messageQueue.ts
import amqp from "amqplib";
import type { Channel, Connection, ConsumeMessage } from "amqplib";
import { RABBITMQ_CONFIG } from "./config";
import type { QueueNames, RoutingKeys } from "./config";
import type { QueueMessage } from "./types";

export class CardanoMessageQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(RABBITMQ_CONFIG.url);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(
        RABBITMQ_CONFIG.exchange,
        "direct",
        { durable: true }
      );

      // Declare queues
      await this.channel.assertQueue(RABBITMQ_CONFIG.queues.balance, { durable: true });
      await this.channel.assertQueue(RABBITMQ_CONFIG.queues.token, { durable: true });

      // Bind queues
      await this.channel.bindQueue(
        RABBITMQ_CONFIG.queues.balance,
        RABBITMQ_CONFIG.exchange,
        "balance"
      );
      await this.channel.bindQueue(
        RABBITMQ_CONFIG.queues.token,
        RABBITMQ_CONFIG.exchange,
        "token"
      );
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  async publish<T>(routingKey: RoutingKeys, message: QueueMessage<T>): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized");
    }
    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date()  // Ensure timestamp is a Date object
      };
      
      const success = this.channel.publish(
        RABBITMQ_CONFIG.exchange,
        routingKey,
        Buffer.from(JSON.stringify(messageWithTimestamp)),
        { persistent: true }
      );

      if (!success) {
        throw new Error("Message was not published successfully");
      }
    } catch (error) {
      console.error("Error publishing message:", error);
      throw error;
    }
  }

  async consume(
    queue: QueueNames,
    callback: (message: QueueMessage<unknown>) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized");
    }
    try {
      await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString()) as QueueMessage<unknown>;
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);
            // Reject the message and don't requeue it if it's malformed
            this.channel?.reject(msg, false);
          }
        }
      });
    } catch (error) {
      console.error("Error consuming message:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.channel = null;
      this.connection = null;
    } catch (error) {
      console.error("Error closing connections:", error);
      throw error;
    }
  }
}

