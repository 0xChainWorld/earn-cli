import Anthropic from "@anthropic-ai/sdk";
import { getConfigValue } from "../utils/config.ts";
import { DEEPSEEK_API_BASE } from "../constants.ts";
import type { Vault } from "../types/index.ts";

const SYSTEM_PROMPT = `You are a DeFi yield assistant inside a CLI tool called "earn-cli".
You help users discover, compare, and deposit into DeFi yield vaults using the LI.FI Earn API.

When the user gives you a natural language request, you need to:
1. Parse their intent (search vaults, find best vault, deposit, check portfolio)
2. Extract parameters (asset, chain, min APY, min TVL, etc.)
3. Return a structured JSON response

Respond ONLY with valid JSON in this format:
{
  "action": "search_vaults" | "best_vault" | "deposit" | "portfolio",
  "params": {
    "asset": "USDC" | "ETH" | "WETH" | etc (optional),
    "chain": "base" | "ethereum" | "arbitrum" | etc (optional),
    "minApy": number (optional),
    "minTvl": number (optional),
    "maxTvl": number (optional),
    "tags": ["stablecoin"] (optional),
    "sortBy": "apy" | "tvl" (optional),
    "amount": number (optional, for deposit),
    "address": "0x..." (optional, for portfolio)
  },
  "explanation": "Brief explanation of what you'll do"
}`;

const ANALYSIS_PROMPT = `You are a DeFi yield analyst. Analyze the following vault data and provide a recommendation.
Be concise, focus on key metrics: APY, TVL, protocol reputation, risk factors (tags).
Format your response as plain text suitable for a CLI terminal (no markdown, keep lines under 80 chars).`;

export interface AiIntent {
  action: "search_vaults" | "best_vault" | "deposit" | "portfolio";
  params: {
    asset?: string;
    chain?: string;
    minApy?: number;
    minTvl?: number;
    maxTvl?: number;
    tags?: string[];
    sortBy?: "apy" | "tvl";
    amount?: number;
    address?: string;
  };
  explanation: string;
}

type AiProvider = "deepseek" | "anthropic";

function detectProvider(): { provider: AiProvider; apiKey: string } {
  const deepseekKey =
    getConfigValue("deepseekKey") || process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    return { provider: "deepseek", apiKey: deepseekKey };
  }

  const anthropicKey =
    getConfigValue("anthropicKey") || process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return { provider: "anthropic", apiKey: anthropicKey };
  }

  throw new Error(
    "No AI API key configured.\n" +
      "Run: earn config set deepseek-key <your-key>\n" +
      " Or: earn config set anthropic-key <your-key>\n" +
      "Or set DEEPSEEK_API_KEY / ANTHROPIC_API_KEY environment variable.",
  );
}

// --- DeepSeek (OpenAI-compatible) ---

async function deepseekChat(
  apiKey: string,
  system: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

// --- Anthropic ---

function anthropicChat(apiKey: string) {
  return new Anthropic({ apiKey });
}

async function anthropicMessage(
  apiKey: string,
  system: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const client = anthropicChat(apiKey);
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });
  return message.content[0]?.type === "text" ? message.content[0].text : "";
}

// --- Unified chat ---

async function chat(
  system: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const { provider, apiKey } = detectProvider();
  if (provider === "deepseek") {
    return deepseekChat(apiKey, system, userMessage, maxTokens);
  }
  return anthropicMessage(apiKey, system, userMessage, maxTokens);
}

// --- Public API ---

export async function parseIntent(userInput: string): Promise<AiIntent> {
  const raw = await chat(SYSTEM_PROMPT, userInput, 500);

  // Strip markdown code fences that some models wrap around JSON
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  try {
    return JSON.parse(text) as AiIntent;
  } catch {
    throw new Error(`Failed to parse AI response: ${raw}`);
  }
}

export async function analyzeVaults(
  vaults: Vault[],
  userQuery: string,
): Promise<string> {
  const vaultSummary = vaults.slice(0, 10).map((v) => ({
    name: v.name,
    protocol: v.protocol.name,
    chain: v.network,
    apy: v.analytics.apy.total,
    apyBase: v.analytics.apy.base,
    apyReward: v.analytics.apy.reward,
    tvl: formatTvlForAi(v.analytics.tvl.usd),
    tags: v.tags,
    tokens: v.underlyingTokens.map((t) => t.symbol),
  }));

  return chat(
    ANALYSIS_PROMPT,
    `User query: "${userQuery}"\n\nVault data:\n${JSON.stringify(vaultSummary, null, 2)}`,
    800,
  );
}

function formatTvlForAi(tvlUsd: string): string {
  const num = parseFloat(tvlUsd);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  return `$${num.toFixed(0)}`;
}
