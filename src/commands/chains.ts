import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getChains } from "../services/earn-api.ts";
import { printChainsTable } from "../utils/format.ts";

export const chainsCommand = new Command("chains")
  .description("List all supported chains")
  .action(async () => {
    const spinner = ora("Fetching chains...").start();

    try {
      const chains = await getChains();
      spinner.stop();

      console.log(chalk.bold(`\n  ${chains.length} Supported Chains\n`));
      printChainsTable(chains);
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
