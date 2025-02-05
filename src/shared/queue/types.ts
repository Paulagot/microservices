//shared/queue/types.ts

import type { CardanoBalance, TokenData } from '../../types/cardanoTypes';
export interface QueueMessage<T> {
  type: 'balance' | 'token';  // Using literal types for better type safety
  walletAddress: string;      // Using walletAddress consistently
  data: T;
  timestamp: Date;           // Using Date type for timestamp
}

export interface BalanceUpdate {
  address: string;
  balances: CardanoBalance[];
}

export interface TokenUpdate {
  address: string;
  tokens: TokenData[];
}

