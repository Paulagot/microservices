//types/cardanoTypes.ts

export interface CardanoBalance {
    unit: string;
    quantity: string;
  }
  
  export interface CardanoMetadata {
    name: string;
    image?: string;
  }
  
  export interface TokenData {
    symbol: string;
    name: string;
    balance: string;
    icon: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }

  export interface BlockfrostAsset {
    unit: string;
    quantity: string;
  }
  
  export interface BlockfrostAddressInfo {
    address: string;
    amount: BlockfrostAsset[];
    stake_address: string;
    type: string;
    script: boolean;
  }
  
  export interface OnChainMetadata {
    name: string;
    image?: string;
    mediaType?: string;
    description?: string;
    [key: string]: unknown;
  }
  
  export interface BlockfrostAssetInfo {
    asset: string;
    policy_id: string;
    asset_name: string;
    fingerprint: string;
    quantity: string;
    initial_mint_tx_hash: string;
    mint_or_burn_count: number;
    onchain_metadata: OnChainMetadata | null;
    onchain_metadata_standard?: string;
    onchain_metadata_extra?: Record<string, unknown> | null;
    metadata: {
      name: string;
      description: string;
      ticker?: string;
      logo?: string;
      url?: string;
    } | null;
  }
  
  
  