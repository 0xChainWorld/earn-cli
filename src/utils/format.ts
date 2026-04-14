import chalk from "chalk";
import Table from "cli-table3";
import type { Vault, Position, Chain, Protocol } from "../types/index.ts";

export function formatApy(apy: number | null): string {
  if (apy === null || apy === undefined) return chalk.gray("N/A");
  if (apy >= 10) return chalk.green.bold(`${apy.toFixed(2)}%`);
  if (apy >= 5) return chalk.green(`${apy.toFixed(2)}%`);
  if (apy >= 1) return chalk.yellow(`${apy.toFixed(2)}%`);
  return chalk.gray(`${apy.toFixed(2)}%`);
}

export function formatTvl(tvlUsd: string): string {
  const num = parseFloat(tvlUsd);
  if (isNaN(num)) return chalk.gray("N/A");
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function formatUsd(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0.00";
  if (num < 0.01 && num > 0) return `<$0.01`;
  return `$${num.toFixed(2)}`;
}

export function printVaultsTable(vaults: Vault[]): void {
  const table = new Table({
    head: [
      chalk.cyan("#"),
      chalk.cyan("Name"),
      chalk.cyan("Protocol"),
      chalk.cyan("Chain"),
      chalk.cyan("APY"),
      chalk.cyan("TVL"),
      chalk.cyan("Tags"),
    ],
    colWidths: [4, 16, 14, 12, 10, 12, 22],
    wordWrap: true,
  });

  vaults.forEach((v, i) => {
    table.push([
      String(i + 1),
      v.name,
      v.protocol.name,
      v.network,
      formatApy(v.analytics.apy.total),
      formatTvl(v.analytics.tvl.usd),
      v.tags.join(", "),
    ]);
  });

  console.log(table.toString());
}

export function printVaultDetail(vault: Vault): void {
  console.log();
  console.log(chalk.bold.white(`  ${vault.name}`));
  console.log(chalk.gray(`  ${vault.slug}`));
  console.log();
  console.log(`  Protocol:  ${chalk.cyan(vault.protocol.name)}`);
  console.log(`  Chain:     ${vault.network} (${vault.chainId})`);
  console.log(
    `  APY:       ${formatApy(vault.analytics.apy.total)} ${chalk.gray(`(base: ${vault.analytics.apy.base?.toFixed(2) ?? "N/A"}%, reward: ${vault.analytics.apy.reward?.toFixed(2) ?? "0"}%)`)}`
  );
  console.log(`  TVL:       ${formatTvl(vault.analytics.tvl.usd)}`);
  console.log(
    `  APY 1d:    ${formatApy(vault.analytics.apy1d)}  7d: ${formatApy(vault.analytics.apy7d)}  30d: ${formatApy(vault.analytics.apy30d)}`
  );
  console.log(`  Tags:      ${vault.tags.join(", ") || "none"}`);
  console.log(
    `  Tokens:    ${vault.underlyingTokens.map((t) => t.symbol).join(", ")}`
  );
  console.log(
    `  Deposit:   ${vault.isTransactional ? chalk.green("yes") : chalk.red("no")}`
  );
  console.log(
    `  Redeem:    ${vault.isRedeemable ? chalk.green("yes") : chalk.red("no")}`
  );
  console.log();
  console.log(
    chalk.gray(`  Use: earn deposit --vault ${vault.slug} --amount <amount>`)
  );
  console.log();
}

export function printPortfolioTable(positions: Position[]): void {
  if (positions.length === 0) {
    console.log(chalk.yellow("  No positions found."));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan("#"),
      chalk.cyan("Protocol"),
      chalk.cyan("Asset"),
      chalk.cyan("Chain ID"),
      chalk.cyan("Balance (USD)"),
    ],
    colWidths: [4, 16, 10, 10, 16],
  });

  positions.forEach((p, i) => {
    table.push([
      String(i + 1),
      p.protocolName,
      p.asset.symbol,
      String(p.chainId),
      formatUsd(p.balanceUsd),
    ]);
  });

  console.log(table.toString());
}

export function printChainsTable(chains: Chain[]): void {
  const table = new Table({
    head: [
      chalk.cyan("Chain ID"),
      chalk.cyan("Name"),
      chalk.cyan("CAIP"),
    ],
    colWidths: [12, 16, 24],
  });

  chains.forEach((c) => {
    table.push([String(c.chainId), c.name, c.networkCaip]);
  });

  console.log(table.toString());
}

export function printProtocolsTable(protocols: Protocol[]): void {
  const table = new Table({
    head: [chalk.cyan("Protocol"), chalk.cyan("URL")],
    colWidths: [18, 60],
    wordWrap: true,
  });

  protocols.forEach((p) => {
    table.push([p.name, p.url]);
  });

  console.log(table.toString());
}
