// Earn Data API types — based on verified API responses (2026-04-14)

export interface Chain {
  chainId: number;
  name: string;
  networkCaip: string;
}

export interface Protocol {
  url: string;
  name: string;
}

export interface UnderlyingToken {
  symbol: string;
  address: string;
  decimals: number;
}

export interface VaultAnalytics {
  apy: {
    base: number;
    total: number;
    reward: number | null;
  };
  tvl: {
    usd: string; // ⚠️ string, not number
  };
  apy1d: number | null;
  apy7d: number | null;
  apy30d: number | null;
  updatedAt: string;
}

export interface DepositPack {
  name: string;
  stepsType: string;
}

export interface Vault {
  name: string;
  slug: string;
  tags: string[];
  address: string;
  chainId: number;
  network: string;
  lpTokens: unknown[];
  protocol: Protocol;
  provider: string;
  syncedAt: string;
  analytics: VaultAnalytics;
  redeemPacks: DepositPack[];
  depositPacks: DepositPack[];
  isRedeemable: boolean;
  isTransactional: boolean;
  underlyingTokens: UnderlyingToken[];
}

export interface VaultsResponse {
  data: Vault[];
  nextCursor: string | null;
  total: number;
}

export interface Position {
  chainId: number;
  protocolName: string;
  asset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  balanceUsd: string;
  balanceNative: string;
}

export interface PortfolioResponse {
  positions: Position[];
}

// Composer API types

export interface QuoteParams {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAddress: string;
  toAddress: string;
  fromAmount: string;
}

export interface QuoteResponse {
  transactionRequest: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    chainId: number;
  };
  estimate?: {
    fromAmount: string;
    toAmount: string;
    gasCosts: Array<{ amount: string; token: { symbol: string } }>;
  };
  [key: string]: unknown;
}

// Config types

export interface EarnConfig {
  wallet?: string;
  apiKey?: string;
  anthropicKey?: string;
  deepseekKey?: string;
}

// Vault query params

export interface VaultQueryParams {
  chainId?: number;
  sortBy?: "apy" | "tvl";
  cursor?: string;
}
