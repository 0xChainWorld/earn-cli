// API base URLs
export const EARN_API_BASE = "https://earn.li.fi";
export const COMPOSER_API_BASE = "https://li.quest";
export const DEEPSEEK_API_BASE = "https://api.deepseek.com";

// Chain name → ID mapping (verified from API 2026-04-14)
export const CHAIN_MAP: Record<string, number> = {
  ethereum: 1,
  eth: 1,
  optimism: 10,
  op: 10,
  bsc: 56,
  bnb: 56,
  gnosis: 100,
  unichain: 130,
  polygon: 137,
  matic: 137,
  monad: 143,
  sonic: 146,
  mantle: 5000,
  base: 8453,
  arbitrum: 42161,
  arb: 42161,
  celo: 42220,
  avalanche: 43114,
  avax: 43114,
  linea: 59144,
  berachain: 80094,
  bera: 80094,
  katana: 747474,
};

// Chain ID → name mapping
export const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  56: "BSC",
  100: "Gnosis",
  130: "Unichain",
  137: "Polygon",
  143: "Monad",
  146: "Sonic",
  5000: "Mantle",
  8453: "Base",
  42161: "Arbitrum",
  42220: "Celo",
  43114: "Avalanche",
  59144: "Linea",
  80094: "Berachain",
  747474: "Katana",
};

export const CONFIG_FILE = ".earnrc";
