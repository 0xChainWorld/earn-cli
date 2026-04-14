# earn-cli

> AI-powered DeFi yield management from your terminal.

Discover, compare, and deposit into yield vaults across **16 chains** and **11 protocols** — all from the command line. Natural language interface powered by Claude AI.

Built for the [DeFi Mullet Hackathon #1](https://li.fi/) — Track 2: AI × Earn.

## Features

- **Vault Discovery** — Browse and filter 600+ vaults by chain, asset, APY, TVL, tags
- **Smart Recommendations** — Auto-find the best yield vault for any asset
- **One-Command Deposits** — Build deposit transactions via LI.FI Composer (cross-chain supported)
- **Portfolio Tracking** — View all DeFi positions for any wallet address
- **AI Assistant** — Natural language queries like `"find the safest USDC vault above 5%"`

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime
- [LI.FI Composer API key](https://portal.li.fi/) (for deposits)
- [Anthropic API key](https://console.anthropic.com/) (for AI features)

### Install & Run

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/earn-cli.git
cd earn-cli

# Install dependencies
bun install

# Configure
bun run src/index.ts config set api-key <your-lifi-api-key>
bun run src/index.ts config set anthropic-key <your-anthropic-key>
bun run src/index.ts config set wallet <your-wallet-address>

# Run
bun run src/index.ts --help
```

## Usage

### Discover Vaults

```bash
# List all vaults on Base
bun run src/index.ts vaults --chain base

# Filter by asset and sort by APY
bun run src/index.ts vaults --chain base --asset usdc --sort apy

# Filter by tag
bun run src/index.ts vaults --tag stablecoin --min-tvl 10000000
```

### Find Best Vault

```bash
# Best USDC vault with TVL > $10M
bun run src/index.ts best --asset usdc --min-tvl 10000000

# Best vault on Arbitrum
bun run src/index.ts best --asset usdc --chain arbitrum
```

### Deposit

```bash
# Build deposit transaction
bun run src/index.ts deposit --vault 8453-0xee8f4ec5... --amount 100
```

### Portfolio

```bash
# Check positions
bun run src/index.ts portfolio 0xYourWallet...

# Or use configured wallet
bun run src/index.ts portfolio
```

### AI Assistant

```bash
# Natural language vault search
bun run src/index.ts ai "find the safest USDC vault above 5% APY"

# AI-powered recommendations
bun run src/index.ts ai "what's the best stablecoin yield on Base with high TVL"

# Portfolio query
bun run src/index.ts ai "show my portfolio"
```

### Utility Commands

```bash
# List supported chains
bun run src/index.ts chains

# List supported protocols
bun run src/index.ts protocols

# Manage config
bun run src/index.ts config get
bun run src/index.ts config set wallet 0x...
```

## Architecture

```
earn-cli
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Command implementations
│   │   ├── vaults.ts         # earn vaults
│   │   ├── best.ts           # earn best
│   │   ├── deposit.ts        # earn deposit
│   │   ├── portfolio.ts      # earn portfolio
│   │   ├── ai.ts             # earn ai (Claude AI)
│   │   ├── chains.ts         # earn chains
│   │   ├── protocols.ts      # earn protocols
│   │   └── config.ts         # earn config
│   ├── services/
│   │   ├── earn-api.ts       # Earn Data API client
│   │   ├── composer-api.ts   # Composer API client
│   │   └── ai-service.ts     # Claude AI integration
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── format.ts         # Output formatting (tables, colors)
│   │   ├── config.ts         # Config file management
│   │   └── chains.ts         # Chain ID ↔ name mapping
│   └── constants.ts          # API URLs, chain maps
```

## API Integration

### Earn Data API (`earn.li.fi`)

- `GET /v1/earn/vaults` — Vault discovery with filtering & pagination
- `GET /v1/earn/chains` — Supported chains
- `GET /v1/earn/protocols` — Supported protocols
- `GET /v1/earn/portfolio/:address/positions` — User positions

No authentication required.

### Composer (`li.quest`)

- `GET /v1/quote` — Build deposit/withdrawal transactions

Requires API key from [LI.FI Partner Portal](https://portal.li.fi/).

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh/) |
| Language | TypeScript |
| CLI Framework | [Commander.js](https://github.com/tj/commander.js) |
| AI | [Claude API](https://anthropic.com/) (Anthropic SDK) |
| Output | chalk, cli-table3, ora |

## What's Next

- Automated rebalancing — monitor positions, auto-move to higher APY
- Multi-wallet support
- Telegram / Discord bot integration
- SDK extraction for other builders
- Withdrawal support

## License

MIT
