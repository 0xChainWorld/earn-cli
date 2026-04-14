import { COMPOSER_API_BASE } from "../constants.ts";
import { getConfigValue } from "../utils/config.ts";
import type { QuoteParams, QuoteResponse } from "../types/index.ts";

export async function getQuote(params: QuoteParams): Promise<QuoteResponse> {
  const apiKey = getConfigValue("apiKey");
  if (!apiKey) {
    throw new Error(
      "Composer API key not configured. Run: earn config set api-key <your-key>\n" +
        "Get your key from https://portal.li.fi/"
    );
  }

  const url = new URL("/v1/quote", COMPOSER_API_BASE);
  url.searchParams.set("fromChain", String(params.fromChain));
  url.searchParams.set("toChain", String(params.toChain));
  url.searchParams.set("fromToken", params.fromToken);
  url.searchParams.set("toToken", params.toToken);
  url.searchParams.set("fromAddress", params.fromAddress);
  url.searchParams.set("toAddress", params.toAddress);
  url.searchParams.set("fromAmount", params.fromAmount);

  const res = await fetch(url.toString(), {
    headers: { "x-lifi-api-key": apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Composer API ${res.status}: ${body}`);
  }

  return res.json() as Promise<QuoteResponse>;
}
