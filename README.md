```markdown
# 🔥 TEFA DEX - Decentralized Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-FFD500)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Deployment](#deployment)
- [Revenue Model](#revenue-model)
- [Frontend](#frontend)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**TEFA DEX** is a decentralized exchange built on the Uniswap V2 AMM model with advanced features including gasless meta-transactions (EIP-2771), protocol fee capture (60/25/10/5 split), cross-chain readiness, and a beautiful responsive UI. The protocol is designed to be community-governed, with fees distributed to liquidity providers, treasury, stakers, and a fee subsidy pool.

---

## Features

### ✅ Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| Token Swaps | ✅ Live | 0.3% fee, constant product AMM |
| Liquidity Pools | ✅ Live | Add/remove liquidity, earn fees |
| Fee Collector | ✅ Live | 60% LP / 25% Treasury / 10% Stakers / 5% FSP |
| Sepolia Deployment | ✅ Live | Testnet deployment ready |
| EIP-2771 Gasless | 🔄 Planned | Signature-based meta-transactions |
| Cross-Chain Bridging | 🔄 Planned | Wormhole/LayerZero integration |

### 🔜 Upcoming Features

- Gasless transactions via Fee Subsidy Pool
- Governance token ($TEFA)
- Yield farming / Staking rewards
- Multi-chain deployment (Arbitrum, Optimism, Base)
- Cross-chain swaps

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                           │
│              MetaMask • WalletConnect • EIP-2771            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│                React + TypeScript • Vite • Tailwind         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SMART CONTRACT LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Router     │→ │    Pool      │  │  FeeCollector    │  │
│  │  (Entry)     │  │  (AMM Logic) │  │  (60/25/10/5)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                         │
│            Ethereum • Arbitrum • Optimism • Base            │
└─────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### Router Contract (`Router.sol`)

The entry point for all DEX interactions.

```solidity
function createPool(address tokenA, address tokenB) external returns (address);
function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external;
function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256);
```

### Pool Contract (`Pool.sol`)

AMM liquidity pool with constant product formula `x * y = k`.

- **Fee:** 0.3%
- **Formula:** `amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)`

### FeeCollector Contract (`FeeCollector.sol`)

Distributes collected fees to four recipients:

| Recipient | Split | Use Case |
|-----------|-------|----------|
| Liquidity Providers | 60% | Passive yield |
| Protocol Treasury | 25% | Operations, grants, buybacks |
| Token Stakers | 10% | veToken rewards |
| Fee Subsidy Pool | 5% | Gas subsidies |

---

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask wallet

### Clone and Install

```bash
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex
npm install
cd frontend && npm install && cd ..
```

### Environment Setup

Create a `.env` file:

```env
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

---

## Deployment

### Local Development (Hardhat)

```bash
# Start local Hardhat node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy-clean.js --network localhost

# Start frontend
cd frontend && npm run dev
```

### Sepolia Testnet

```bash
npx hardhat run scripts/deploy-sepolia-fees.js --network sepolia
```

### Mainnet (Coming Soon)

```bash
npx hardhat run scripts/deploy-mainnet.js --network mainnet
```

### Contract Verification (Etherscan)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Revenue Model

| Daily Volume | Swap Fees (0.3%) | LP (60%) | Treasury (25%) | Stakers (10%) | FSP (5%) |
|--------------|------------------|----------|----------------|---------------|----------|
| $1M | $3,000 | $1,800 | $750 | $300 | $150 |
| $10M | $30,000 | $18,000 | $7,500 | $3,000 | $1,500 |
| $100M | $300,000 | $180,000 | $75,000 | $30,000 | $15,000 |

**Projected Annual Revenue (at $10M daily volume):** ~$10.95M

---

## Frontend

### Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- ethers.js v6

### Live URL

```
http://147.182.193.26:5173
```

### Network Configuration

| Network | RPC URL | Chain ID |
|---------|---------|----------|
| Hardhat Local | `http://localhost:8545` | 31337 |
| Sepolia | `https://rpc.sepolia.org` | 11155111 |

### Token Addresses (Sepolia)

```
TKA: 0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f
TKB: 0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E
Router: 0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2
Pool: 0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4
```

---

## Testing

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/swap.js

# Check balances
npx hardhat run scripts/check-balance.js --network sepolia
```

---

## Project Structure

```
tefa-dex/
├── contracts/
│   ├── Router.sol           # Main routing contract
│   ├── Pool.sol             # AMM liquidity pool
│   ├── FeeCollector.sol     # Fee distribution (60/25/10/5)
│   ├── MockERC20.sol        # Test tokens
│   └── TrustedForwarder.sol # EIP-2771 gasless (coming soon)
├── scripts/
│   ├── deploy-clean.js      # Local deployment
│   ├── deploy-sepolia-fees.js # Sepolia with fee collector
│   └── check-balance.js     # Utility scripts
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/          # Contract addresses
│   │   └── App.tsx          # Main app
│   └── package.json
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Roadmap

### Phase 1: Core DEX (Complete)
- ✅ Router and Pool contracts
- ✅ Liquidity provision
- ✅ Swap functionality
- ✅ Frontend UI

### Phase 2: Revenue Model (In Progress)
- ✅ Fee Collector (60/25/10/5 split)
- 🔄 Treasury management
- 🔄 Staking rewards

### Phase 3: Gasless Transactions (Upcoming)
- ⬜ EIP-2771 TrustedForwarder
- ⬜ Fee Subsidy Pool
- ⬜ Relayer network

### Phase 4: Multi-Chain (Upcoming)
- ⬜ Arbitrum deployment
- ⬜ Optimism deployment
- ⬜ Base deployment
- ⬜ Cross-chain bridge

### Phase 5: Governance (Upcoming)
- ⬜ $TEFA token launch
- ⬜ DAO setup
- ⬜ veToken model

---

## Security

- ReentrancyGuard on all external functions
- Slippage protection
- Deadline parameters
- Access control for admin functions
- Timelock for governance changes

**Audit Status:** Pending (scheduled for Phase 5)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Uniswap V2 for AMM inspiration
- OpenZeppelin for battle-tested contracts
- EIP-2771 for gasless transaction standard

---

## Contact

- GitHub: [@GeraldNdlovu](https://github.com/GeraldNdlovu)
- Project Link: [https://github.com/GeraldNdlovu/tefa-dex](https://github.com/GeraldNdlovu/tefa-dex)

---

**Built with 🔥 by the TEFA Team**
```

Now save, commit, and push:

```bash
# Save the file (Ctrl+O, Enter, Ctrl+X)

# Add and commit
git add README.md
git commit -m "docs: Add comprehensive README with architecture, features, and roadmap"

# Push to GitHub
git push origin main
```
