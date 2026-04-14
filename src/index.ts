#!/usr/bin/env bun
import { Command } from "commander";
import { vaultsCommand } from "./commands/vaults.ts";
import { bestCommand } from "./commands/best.ts";
import { depositCommand } from "./commands/deposit.ts";
import { portfolioCommand } from "./commands/portfolio.ts";
import { chainsCommand } from "./commands/chains.ts";
import { protocolsCommand } from "./commands/protocols.ts";
import { configCommand } from "./commands/config.ts";
import { aiCommand } from "./commands/ai.ts";

const program = new Command();

program
  .name("earn")
  .version("1.0.0")
  .description(
    "earn-cli — AI-powered DeFi yield management from your terminal.\n" +
      "Discover, compare, and deposit into yield vaults across 16 chains and 11 protocols.\n\n" +
      "Powered by LI.FI Earn API + Composer."
  );

program.addCommand(vaultsCommand);
program.addCommand(bestCommand);
program.addCommand(depositCommand);
program.addCommand(portfolioCommand);
program.addCommand(chainsCommand);
program.addCommand(protocolsCommand);
program.addCommand(configCommand);
program.addCommand(aiCommand);

program.parse();
