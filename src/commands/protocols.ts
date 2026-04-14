import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getProtocols } from "../services/earn-api.ts";
import { printProtocolsTable } from "../utils/format.ts";

export const protocolsCommand = new Command("protocols")
  .description("List all supported protocols")
  .action(async () => {
    const spinner = ora("Fetching protocols...").start();

    try {
      const protocols = await getProtocols();
      spinner.stop();

      console.log(chalk.bold(`\n  ${protocols.length} Supported Protocols\n`));
      printProtocolsTable(protocols);
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
