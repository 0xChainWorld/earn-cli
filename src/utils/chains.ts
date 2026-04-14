import { CHAIN_MAP } from "../constants.ts";

/**
 * Resolve a chain name or ID string to a numeric chain ID.
 * Accepts: "base", "Base", "8453", etc.
 */
export function resolveChainId(input: string): number | undefined {
  // Try as number first
  const num = parseInt(input, 10);
  if (!isNaN(num)) return num;

  // Try as name (case-insensitive)
  return CHAIN_MAP[input.toLowerCase()];
}
