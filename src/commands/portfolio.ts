import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getPortfolio } from "../services/earn-api.ts";
import { getConfigValue } from "../utils/config.ts";
import { printPortfolioTable, formatUsd } from "../utils/format.ts";

export const portfolioCommand = new Command("portfolio")
  .description("View DeFi positions for a wallet address")
  .argument("[address]", "Wallet address (or use config)")
  .action(async (addressArg) => {
    const address = addressArg || getConfigValue("wallet");
    if (!address) {
      console.log(
        chalk.red(
          "Wallet address required. Provide as argument or: earn config set wallet <address>"
        )
      );
      return;
    }

    const spinner = ora(`Fetching portfolio for ${address.slice(0, 10)}...`).start();

    try {
      const data = await getPortfolio(address);
      spinner.stop();

      // Filter out zero-balance positions
      const positions = data.positions.filter(
        (p) => parseFloat(p.balanceUsd) > 0.001
      );

      const totalUsd = positions.reduce(
        (sum, p) => sum + parseFloat(p.balanceUsd),
        0
      );

      console.log(
        chalk.bold(`\n  Portfolio for ${address.slice(0, 6)}...${address.slice(-4)}`)
      );
      console.log(
        chalk.bold(`  Total Value: ${formatUsd(String(totalUsd))}`)
      );
      console.log(
        chalk.gray(`  ${positions.length} active position(s)\n`)
      );

      printPortfolioTable(positions);
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
