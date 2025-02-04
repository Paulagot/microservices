//shared/queue/types.ts

import { CardanoBalance, TokenData } from '../../types/cardanoTypes';

export interface QueueMessage<T> {
  type: string;
  data: T;
  timestamp: Date;
}

export interface BalanceUpdate {
  address: string;
  balances: CardanoBalance[];
}

export interface TokenUpdate {
  address: string;
  tokens: TokenData[];
}
