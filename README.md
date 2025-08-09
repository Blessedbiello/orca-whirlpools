# Token-2022 Transfer Hook Trading Solution

A complete solution enabling Token-2022 assets with Transfer Hooks to be traded on Orca Whirlpools AMM.

## Overview

This project extends Orca Whirlpools with an automated Transfer Hook registry system, making it the first major AMM to support trading Token-2022 with active Transfer Hooks.

**Key Innovation**: Orca already supports Transfer Hooks through V2 instructions, but requires manual TokenBadge approval. Our registry automates this process while maintaining security.

## Implementation

### Smart Contracts

**Transfer Hook Registry** (`/programs/transfer-hook-registry/`)
- Automated risk assessment (0-100 scoring)
- Community governance voting system  
- Automated TokenBadge creation for approved hooks
- Integration with existing Orca V2 instructions

### Frontend Application

**Next.js Interface** (`/frontend/`)
- Token-2022 creation with Transfer Hook templates
- Pool creation with Transfer Hook validation
- Trading interface with seamless hook execution
- Registry dashboard with governance features

## Quick Start

### Prerequisites

```bash
# Install dependencies
node --version  # >= 18.0.0
rustc --version # >= 1.70.0
solana --version # >= 1.17.22
anchor --version # >= 0.29.0
```

### Setup

```bash
# Clone and install
git clone https://github.com/Blessedbiello/orca-whirlpools.git
cd orca-whirlpools
yarn install

# Build programs
yarn build programs/whirlpool
yarn build programs/transfer-hook-registry

# Start frontend
cd frontend
npm install
npm run dev
```

### Local Development

```bash
# Terminal 1: Start validator
solana-test-validator --reset

# Terminal 2: Deploy programs  
anchor deploy

# Terminal 3: Run frontend
cd frontend && npm run dev
```

## Usage Flow

### 1. Create Token with Transfer Hook

```typescript
// Example: Create token with royalty hook
const tokenCreator = {
  name: "Artist Token",
  symbol: "ART", 
  transferHook: "royalty", // Built-in template
  supply: 1000000
}
```

### 2. Registry Approval

- Hook automatically submitted for review
- Automated risk assessment (security analysis)
- Community governance voting
- TokenBadge creation upon approval

### 3. Create Trading Pool

```typescript
// Example: Create ART/SOL pool
const poolCreator = {
  tokenA: "ART_MINT_ADDRESS",
  tokenB: "SOL_MINT_ADDRESS", 
  feeTier: 0.3,
  initialLiquidity: { amountA: 1000, amountB: 50 }
}
```

### 4. Trade with Transfer Hooks

- Select pool with Transfer Hook tokens
- Execute swaps with automatic hook execution
- Hooks run seamlessly (royalties, compliance, etc.)

## Architecture

### Registry System
```
Submit Hook → Risk Assessment → Community Vote → TokenBadge → Trading Enabled
```

### Integration Points
- **Orca V2 Instructions**: Extends existing Transfer Hook support
- **TokenBadge System**: Automates Orca's whitelist mechanism  
- **Registry Governance**: Community-driven approval process

## Key Features

- ✅ **Complete UI**: Token creation, pool creation, trading
- ✅ **Automated Safety**: Risk scoring + community governance  
- ✅ **Seamless Trading**: Transfer Hooks execute transparently
- ✅ **Production Ready**: Built on proven Orca infrastructure
- ✅ **Multiple Hook Support**: Registry handles unlimited programs

## Project Structure

```
orca-whirlpools/
├── programs/
│   ├── whirlpool/              # Existing Orca program
│   └── transfer-hook-registry/ # New registry program
├── frontend/                   # Next.js application
├── README.md                   # This file
├── DEMO_SCRIPT.md             # Video demo walkthrough
└── TRANSFER_HOOK_SOLUTION_README.md # Detailed technical docs
```

## Demo

A complete demonstration showing:
1. Token creation with Transfer Hook
2. Registry submission and approval  
3. Pool creation with Transfer Hook validation
4. Trading with automatic hook execution

See `DEMO_SCRIPT.md` for detailed walkthrough.

## Technical Details

For comprehensive technical documentation, architecture details, and bounty requirement fulfillment, see `TRANSFER_HOOK_SOLUTION_README.md`.

## Contributing

This solution enables Token-2022 adoption in Solana DeFi while maintaining security standards. Contributions welcome for:

- Additional Transfer Hook templates
- Enhanced risk assessment algorithms  
- Governance mechanism improvements
- UI/UX enhancements

## License

See LICENSE file in repository root.