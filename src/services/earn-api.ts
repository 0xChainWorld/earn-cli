import { EARN_API_BASE } from "../constants.ts";
import type {
  Chain,
  Protocol,
  Vault,
  VaultsResponse,
  PortfolioResponse,
  VaultQueryParams,
} from "../types/index.ts";

async function fetchJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, EARN_API_BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Earn API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getChains(): Promise<Chain[]> {
  return fetchJson<Chain[]>("/v1/earn/chains");
}

export async function getProtocols(): Promise<Protocol[]> {
  return fetchJson<Protocol[]>("/v1/earn/protocols");
}

export async function getVaults(params?: VaultQueryParams): Promise<VaultsResponse> {
  const query: Record<string, string> = {};
  if (params?.chainId) query.chainId = String(params.chainId);
  if (params?.sortBy) query.sortBy = params.sortBy;
  if (params?.cursor) query.cursor = params.cursor;
  return fetchJson<VaultsResponse>("/v1/earn/vaults", query);
}

/**
 * Fetch all vaults across all pages for a given query.
 */
export async function getAllVaults(params?: Omit<VaultQueryParams, "cursor">): Promise<Vault[]> {
  const all: Vault[] = [];
  let cursor: string | undefined;

  do {
    const res = await getVaults({ ...params, cursor });
    all.push(...res.data);
    cursor = res.nextCursor ?? undefined;
  } while (cursor);

  return all;
}

export async function getPortfolio(address: string): Promise<PortfolioResponse> {
  return fetchJson<PortfolioResponse>(`/v1/earn/portfolio/${address}/positions`);
}

/**
 * Find a vault by its slug (e.g., "8453-0xee8f...").
 * Since the vault detail endpoint returns 404, we search the list.
 */
export async function getVaultBySlug(slug: string): Promise<Vault | undefined> {
  const parts = slug.split("-");
  if (parts.length < 2) return undefined;

  const chainId = parseInt(parts[0]!, 10);
  if (isNaN(chainId)) return undefined;

  const res = await getVaults({ chainId });
  // Search through all pages if needed
  let vault = res.data.find((v) => v.slug === slug);
  if (vault) return vault;

  let cursor = res.nextCursor;
  while (cursor && !vault) {
    const next = await getVaults({ chainId, cursor });
    vault = next.data.find((v) => v.slug === slug);
    cursor = next.nextCursor ?? undefined;
  }

  return vault;
}
