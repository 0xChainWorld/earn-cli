import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getVaultBySlug } from "../services/earn-api.ts";
import { getQuote } from "../services/composer-api.ts";
import { getConfigValue } from "../utils/config.ts";
import { printVaultDetail, formatApy, formatTvl } from "../utils/format.ts";

export const depositCommand = new Command("deposit")
  .description("Build a deposit transaction for a vault")
  .requiredOption("-v, --vault <slug>", "Vault slug (e.g., 8453-0xee8f...)")
  .requiredOption("-a, --amount <number>", "Amount to deposit (in token units, e.g., 100 for 100 USDC)")
  .option("-w, --wallet <address>", "Wallet address (or use config)")
  .action(async (opts) => {
    const spinner = ora("Fetching vault details...").start();

    try {
      // Resolve wallet
      const wallet = opts.wallet || getConfigValue("wallet");
      if (!wallet) {
        spinner.fail(
          "Wallet address required. Use --wallet or: earn config set wallet <address>"
        );
        return;
      }

      // Find vault
      const vault = await getVaultBySlug(opts.vault);
      if (!vault) {
        spinner.fail(`Vault not found: ${opts.vault}`);
        return;
      }

      if (!vault.isTransactional) {
        spinner.fail(`Vault ${vault.name} does not support deposits via Composer.`);
        return;
      }

      spinner.text = "Building transaction via Composer...";

      // Calculate amount in smallest unit
      const token = vault.underlyingTokens[0];
      if (!token) {
        spinner.fail("Vault has no underlying token.");
        return;
      }

      const amountRaw = BigInt(
        Math.floor(parseFloat(opts.amount) * 10 ** token.decimals)
      ).toString();

      // Build quote
      const quote = await getQuote({
        fromChain: vault.chainId,
        toChain: vault.chainId,
        fromToken: token.address,
        toToken: vault.address,
        fromAddress: wallet,
        toAddress: wallet,
        fromAmount: amountRaw,
      });

      spinner.stop();

      console.log(chalk.bold.green("\n  Deposit Transaction Built\n"));
      printVaultDetail(vault);

      console.log(chalk.bold("  Transaction Details:"));
      console.log(`  From:      ${wallet}`);
      console.log(`  Amount:    ${opts.amount} ${token.symbol}`);
      console.log(`  Raw:       ${amountRaw} (${token.decimals} decimals)`);
      console.log(`  Vault:     ${vault.name} (${vault.protocol.name})`);
      console.log(`  Chain:     ${vault.network} (${vault.chainId})`);
      console.log();

      if (quote.transactionRequest) {
        console.log(chalk.bold("  Transaction Request:"));
        console.log(
          chalk.gray(JSON.stringify(quote.transactionRequest, null, 2))
        );
      }

      if (quote.estimate) {
        console.log(chalk.bold("\n  Estimate:"));
        console.log(
          chalk.gray(JSON.stringify(quote.estimate, null, 2))
        );
      }

      console.log(
        chalk.yellow(
          "\n  ⚠  Send this transaction via your wallet to complete the deposit."
        )
      );
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
    }
  });
