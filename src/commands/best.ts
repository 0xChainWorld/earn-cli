import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getAllVaults } from "../services/earn-api.ts";
import { resolveChainId } from "../utils/chains.ts";
import { printVaultDetail } from "../utils/format.ts";

export const bestCommand = new Command("best")
  .description("Find the best yield vault for a given asset")
  .option("-a, --asset <symbol>", "Asset symbol (e.g., USDC, ETH)")
  .option("-c, --chain <chain>", "Filter by chain name or ID")
  .option("--min-tvl <usd>", "Minimum TVL in USD (for safety)", "1000000")
  .option("--top <number>", "Show top N vaults", "3")
  .action(async (opts) => {
    const spinner = ora("Finding best vaults...").start();

    try {
      const chainId = opts.chain ? resolveChainId(opts.chain) : undefined;
      if (opts.chain && !chainId) {
        spinner.fail(`Unknown chain: ${opts.chain}`);
        return;
      }

      let vaults = await getAllVaults({ chainId, sortBy: "apy" });

      // Only transactional vaults (can deposit)
      vaults = vaults.filter((v) => v.isTransactional);

      if (opts.asset) {
        const asset = opts.asset.toUpperCase();
        vaults = vaults.filter((v) =>
          v.underlyingTokens.some((t) => t.symbol.toUpperCase() === asset)
        );
      }

      const minTvl = parseFloat(opts.minTvl) || 0;
      if (minTvl > 0) {
        vaults = vaults.filter((v) => parseFloat(v.analytics.tvl.usd) >= minTvl);
      }

      // Sort by total APY descending
      vaults.sort((a, b) => b.analytics.apy.total - a.analytics.apy.total);

      const top = parseInt(opts.top, 10) || 3;
      const topVaults = vaults.slice(0, top);

      spinner.stop();

      if (topVaults.length === 0) {
        console.log(chalk.yellow("No vaults found matching your criteria."));
        return;
      }

      console.log(
        chalk.bold.green(
          `\n  Best Vault${topVaults.length > 1 ? "s" : ""} for ${opts.asset?.toUpperCase() || "all assets"}\n`
        )
      );

      topVaults.forEach((v, i) => {
        if (topVaults.length > 1) {
          console.log(chalk.bold(`  #${i + 1}`));
        }
        printVaultDetail(v);
      });
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
