import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { parseIntent, analyzeVaults } from "../services/ai-service.ts";
import { getAllVaults } from "../services/earn-api.ts";
import { getPortfolio } from "../services/earn-api.ts";
import { getQuote } from "../services/composer-api.ts";
import { resolveChainId } from "../utils/chains.ts";
import { getConfigValue } from "../utils/config.ts";
import {
  printVaultsTable,
  printVaultDetail,
  printPortfolioTable,
  formatUsd,
} from "../utils/format.ts";
import type { Vault } from "../types/index.ts";

export const aiCommand = new Command("ai")
  .description("Natural language DeFi yield assistant powered by AI")
  .argument("<query...>", 'Your request in natural language (e.g., "find the safest USDC vault above 5%")')
  .action(async (queryParts: string[]) => {
    const query = queryParts.join(" ");

    console.log(chalk.gray(`\n  Query: "${query}"\n`));

    const spinner = ora("AI is thinking...").start();

    try {
      // Step 1: Parse intent
      const intent = await parseIntent(query);

      spinner.text = `Action: ${intent.action} — ${intent.explanation}`;

      // Step 2: Execute based on intent
      switch (intent.action) {
        case "search_vaults":
        case "best_vault": {
          spinner.text = "Fetching vaults...";

          const chainId = intent.params.chain
            ? resolveChainId(intent.params.chain)
            : undefined;

          let vaults = await getAllVaults({
            chainId,
            sortBy: intent.params.sortBy || "apy",
          });

          // Apply filters
          if (intent.params.asset) {
            const asset = intent.params.asset.toUpperCase();
            vaults = vaults.filter((v) =>
              v.underlyingTokens.some(
                (t) => t.symbol.toUpperCase() === asset
              )
            );
          }

          if (intent.params.tags?.length) {
            vaults = vaults.filter((v) =>
              intent.params.tags!.some((tag) => v.tags.includes(tag))
            );
          }

          if (intent.params.minTvl) {
            vaults = vaults.filter(
              (v) =>
                parseFloat(v.analytics.tvl.usd) >= intent.params.minTvl!
            );
          }

          if (intent.params.minApy) {
            vaults = vaults.filter(
              (v) => v.analytics.apy.total >= intent.params.minApy!
            );
          }

          // Only transactional vaults
          vaults = vaults.filter((v) => v.isTransactional);

          // Sort by APY
          vaults.sort(
            (a, b) => b.analytics.apy.total - a.analytics.apy.total
          );

          spinner.text = "AI is analyzing results...";

          // Step 3: AI analysis
          const analysis = await analyzeVaults(vaults, query);

          spinner.stop();

          console.log(chalk.bold.cyan("  AI Analysis:\n"));
          console.log(
            analysis
              .split("\n")
              .map((l) => "  " + l)
              .join("\n")
          );
          console.log();

          if (intent.action === "best_vault") {
            const top = vaults.slice(0, 3);
            top.forEach((v, i) => {
              console.log(chalk.bold(`  #${i + 1}`));
              printVaultDetail(v);
            });
          } else {
            printVaultsTable(vaults.slice(0, 15));
          }
          break;
        }

        case "portfolio": {
          const address =
            intent.params.address || getConfigValue("wallet");
          if (!address) {
            spinner.fail(
              "Wallet address needed. Configure with: earn config set wallet <address>"
            );
            return;
          }

          spinner.text = `Fetching portfolio for ${address.slice(0, 10)}...`;
          const data = await getPortfolio(address);

          spinner.stop();

          const positions = data.positions.filter(
            (p) => parseFloat(p.balanceUsd) > 0.001
          );
          const totalUsd = positions.reduce(
            (sum, p) => sum + parseFloat(p.balanceUsd),
            0
          );

          console.log(
            chalk.bold(
              `\n  Portfolio for ${address.slice(0, 6)}...${address.slice(-4)}`
            )
          );
          console.log(chalk.bold(`  Total Value: ${formatUsd(String(totalUsd))}\n`));

          printPortfolioTable(positions);
          break;
        }

        case "deposit": {
          spinner.fail(
            "AI-driven deposit requires explicit confirmation.\n" +
              "  Use: earn deposit --vault <slug> --amount <amount>"
          );
          break;
        }

        default:
          spinner.fail(`Unknown action: ${intent.action}`);
      }
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
