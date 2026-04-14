import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getAllVaults } from "../services/earn-api.ts";
import { resolveChainId } from "../utils/chains.ts";
import { printVaultsTable } from "../utils/format.ts";
import type { Vault } from "../types/index.ts";

export const vaultsCommand = new Command("vaults")
  .description("List and filter DeFi yield vaults")
  .option("-c, --chain <chain>", "Filter by chain name or ID (e.g., base, 8453)")
  .option("-a, --asset <symbol>", "Filter by asset symbol (e.g., USDC, ETH)")
  .option("-t, --tag <tag>", "Filter by tag (stablecoin, single, multi, il-risk)")
  .option("-s, --sort <field>", "Sort by field: apy, tvl", "apy")
  .option("-n, --limit <number>", "Number of results to show", "20")
  .option("--min-tvl <usd>", "Minimum TVL in USD")
  .option("--min-apy <percent>", "Minimum APY percentage")
  .action(async (opts) => {
    const spinner = ora("Fetching vaults...").start();

    try {
      const chainId = opts.chain ? resolveChainId(opts.chain) : undefined;
      if (opts.chain && !chainId) {
        spinner.fail(`Unknown chain: ${opts.chain}`);
        return;
      }

      const sortBy = opts.sort === "tvl" ? "tvl" as const : "apy" as const;
      let vaults = await getAllVaults({ chainId, sortBy });

      // Client-side filtering
      if (opts.asset) {
        const asset = opts.asset.toUpperCase();
        vaults = vaults.filter((v) =>
          v.underlyingTokens.some((t) => t.symbol.toUpperCase() === asset)
        );
      }

      if (opts.tag) {
        vaults = vaults.filter((v) => v.tags.includes(opts.tag));
      }

      if (opts.minTvl) {
        const minTvl = parseFloat(opts.minTvl);
        vaults = vaults.filter((v) => parseFloat(v.analytics.tvl.usd) >= minTvl);
      }

      if (opts.minApy) {
        const minApy = parseFloat(opts.minApy);
        vaults = vaults.filter((v) => v.analytics.apy.total >= minApy);
      }

      // Sort client-side for consistency
      if (sortBy === "apy") {
        vaults.sort((a, b) => b.analytics.apy.total - a.analytics.apy.total);
      } else {
        vaults.sort(
          (a, b) =>
            parseFloat(b.analytics.tvl.usd) - parseFloat(a.analytics.tvl.usd)
        );
      }

      const limit = parseInt(opts.limit, 10) || 20;
      vaults = vaults.slice(0, limit);

      spinner.stop();

      if (vaults.length === 0) {
        console.log(chalk.yellow("No vaults found matching your criteria."));
        return;
      }

      console.log(
        chalk.bold(`\n  Found ${vaults.length} vault(s)`) +
          (chainId ? ` on chain ${opts.chain}` : "") +
          (opts.asset ? ` for ${opts.asset.toUpperCase()}` : "") +
          "\n"
      );

      printVaultsTable(vaults);
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
