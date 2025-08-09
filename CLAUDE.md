# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Orca's Whirlpools monorepo - an open-source concentrated liquidity AMM (Automated Market Maker) contract on Solana. The repository contains Rust smart contracts and TypeScript/Rust SDKs for interacting with the deployed program at address `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`.

## Build System

The project uses **NX** as a monorepo build system with **Yarn 4.6.0** as the package manager. All commands should be run from the root directory as NX handles dependency resolution between packages.

### Core Build Commands
- **`yarn build`** - Compile all components (uses `nx run-many --target build`)
- **`yarn test`** - Run tests for all components (uses `nx run-many --target test`)  
- **`yarn format`** - Format code across all packages
- **`yarn lint`** - Lint all packages
- **`yarn clean`** - Clean all build artifacts (`nx reset && nx run-many --target clean`)

### Package-Specific Commands
To run commands for specific packages: `yarn build programs/whirlpool`, `yarn test legacy-sdk/whirlpool`

For streaming logs during long operations: `yarn test --output-style stream`

## Testing

### TypeScript Testing
- Uses **Vitest** for testing framework
- Legacy SDK uses external programs loaded via `Anchor.toml` test validator configuration
- Test files follow pattern `*.test.ts`
- Integration tests require copying token_2022 program: `cp ../../legacy-sdk/whirlpool/tests/external_program/token_2022.20250510.so ../../target/deploy/`

### Rust Testing  
- Standard `cargo test` for Rust components
- Program testing: `cargo test -p whirlpool --lib`
- SDK testing: `cargo test --lib` (requires token_2022 program copied to target/deploy/)

### Anchor Testing
- Uses Anchor local validator with custom configuration in `Anchor.toml`
- Test timeout: 1,000,000ms with `--no-file-parallelism`
- Preloaded accounts for specific test scenarios (e.g., reset_position_range)

## Architecture

### Main Components

**Programs** (`/programs/`)
- **whirlpool** - Core Solana program (Anchor-based) containing AMM logic
  - Built with Anchor v0.29.0 and Solana v1.17.22
  - Contains instructions for pool management, position management, swaps, and fee collection
  - State modules: whirlpool, position, tick_array, fee_tier, etc.

**TypeScript SDKs** (`/ts-sdk/`)
- **@orca-so/whirlpools** - High-level TS SDK (v3.x, modern, uses Solana Kit v2.1.0)
- **@orca-so/whirlpools-client** - Auto-generated client for account/instruction parsing
- **@orca-so/whirlpools-core** - Math and utility functions (WASM-compiled from Rust)
- **@orca-so/tx-sender** - Transaction building and sending utilities

**Rust SDKs** (`/rust-sdk/`)  
- **orca_whirlpools** - High-level Rust SDK for pool operations
- **orca_whirlpools_client** - Auto-generated client matching TS version
- **orca_whirlpools_core** - Core math and utility functions
- **orca_whirlpools_macros** - Proc macros for WASM bindings

**Legacy SDK** (`/legacy-sdk/`)
- **@orca-so/whirlpools-sdk** - Legacy TS SDK (v0.15.x, uses Solana Web3.js v1.x)
- **@orca-so/common-sdk** - Shared utilities for legacy SDK
- Extensive integration test suite

### Key Concepts
- **Concentrated Liquidity**: Positions have specific price ranges with tick-based pricing
- **Sparse Swap**: Efficient swapping across multiple tick arrays  
- **Position Bundles**: NFT-based position management with metadata
- **Adaptive Fee Tiers**: Dynamic fee structures based on pool activity
- **Token Extensions**: Support for Token-2022 with transfer hooks and metadata

## Development Environment

### Requirements
- Node.js with gcc-12 (Mac: `brew install node gcc@12`)
- Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Solana CLI v1.17.22: `curl -sSfL https://release.solana.com/v1.17.22/install | sh`
- Anchor v0.29.0: `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force && avm install 0.29.0 && avm use 0.29.0`

### Solana Setup
```bash
solana-keygen new                                    # Create wallet
solana config set --url https://api.devnet.solana.com  # Set to devnet
solana airdrop 1                                     # Get test SOL
```

## Common Workflows

### Program Development
1. Make changes to `/programs/whirlpool/src/`
2. Build: `yarn build programs/whirlpool`
3. Test: `yarn test programs/whirlpool` 
4. Format: `yarn format programs/whirlpool`

### SDK Development
1. Modify SDK code in `/ts-sdk/` or `/rust-sdk/`
2. Rebuild dependencies: `yarn build` (NX handles dependency order)
3. Run specific tests: `yarn test ts-sdk/whirlpool`

### Integration Testing
1. Legacy integration tests: `yarn test legacy-sdk/whirlpool`
2. Requires local validator with preloaded accounts from `Anchor.toml`

### Code Quality
- Format: Uses `cargo fmt` for Rust, standard formatters for TS
- Lint: `cargo clippy` for Rust, ESLint for TypeScript
- Always run format and lint before commits

### Deployment
- Programs: Uses `scripts/deploy-cargo` for Rust packages
- NPM packages: Uses `scripts/deploy-npm` for TypeScript packages  
- Versioning managed through Changesets (`yarn changeset`)

## Important Notes

- The repository uses verifiable builds - on-chain program hash matches repository hash
- Program has been audited multiple times (Kudelski, Neodyme, OtterSec, Sec3)
- All commands must be run from repository root due to NX workspace setup
- Legacy SDK required for projects using Solana Web3.js v1.x
- New projects should use modern SDKs with Solana Kit v2.x