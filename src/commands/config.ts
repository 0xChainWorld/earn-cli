import { Command } from "commander";
import chalk from "chalk";
import { loadConfig, saveConfig } from "../utils/config.ts";
import type { EarnConfig } from "../types/index.ts";

const KEY_MAP: Record<string, keyof EarnConfig> = {
  wallet: "wallet",
  "api-key": "apiKey",
  apikey: "apiKey",
  "anthropic-key": "anthropicKey",
  anthropickey: "anthropicKey",
  "deepseek-key": "deepseekKey",
  deepseekkey: "deepseekKey",
};

export const configCommand = new Command("config")
  .description("Manage earn-cli configuration");

configCommand
  .command("set <key> <value>")
  .description("Set a config value (wallet, api-key, anthropic-key)")
  .action((key: string, value: string) => {
    const configKey = KEY_MAP[key.toLowerCase()];
    if (!configKey) {
      console.log(chalk.red(`Unknown config key: ${key}`));
      console.log(chalk.gray("Available keys: wallet, api-key, anthropic-key, deepseek-key"));
      return;
    }

    saveConfig({ [configKey]: value });
    console.log(chalk.green(`  ✓ ${key} saved`));
  });

configCommand
  .command("get [key]")
  .description("Show config values")
  .action((key?: string) => {
    const config = loadConfig();

    if (key) {
      const configKey = KEY_MAP[key.toLowerCase()];
      if (!configKey) {
        console.log(chalk.red(`Unknown config key: ${key}`));
        return;
      }
      const value = config[configKey];
      if (value) {
        // Mask sensitive values
        const masked =
          configKey === "wallet"
            ? value
            : value.slice(0, 8) + "..." + value.slice(-4);
        console.log(`  ${key}: ${masked}`);
      } else {
        console.log(chalk.gray(`  ${key}: not set`));
      }
    } else {
      console.log(chalk.bold("\n  earn-cli config\n"));
      console.log(
        `  wallet:        ${config.wallet || chalk.gray("not set")}`
      );
      console.log(
        `  api-key:       ${config.apiKey ? config.apiKey.slice(0, 8) + "..." : chalk.gray("not set")}`
      );
      console.log(
        `  anthropic-key: ${config.anthropicKey ? config.anthropicKey.slice(0, 8) + "..." : chalk.gray("not set")}`
      );
      console.log(
        `  deepseek-key:  ${config.deepseekKey ? config.deepseekKey.slice(0, 8) + "..." : chalk.gray("not set")}`
      );
      console.log();
    }
  });
