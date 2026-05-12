---

```markdown
# 🔥 TEFA DEX - Decentralized Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-FFD500)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-8A2BE2)](https://sepolia.etherscan.io/)

A production-ready decentralized exchange built on Uniswap V2 AMM model with gasless meta-transactions, protocol fee capture, and a beautiful responsive UI.

## ✨ Live Demo

**🌐 Frontend**: http://147.182.193.26:5173

**📡 Network**: Sepolia Testnet | **Chain ID**: 11155111

## 🚀 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Token Swaps | ✅ Live | 0.3% fee, constant product AMM |
| Liquidity Pools | ✅ Live | Add/remove liquidity, earn fees |
| Fee Collection | ✅ Live | 60/25/10/5 split architecture |
| LP Analytics | ✅ Live | Track earnings and pool share |
| Sepolia Deployment | ✅ Live | Testnet ready |
| Cross-Chain | 🔄 Planned | Arbitrum, Optimism, Base |

## 📊 Protocol Fees

```
┌─────────────────────────────────────────┐
│         Swap Fee (0.3%)                 │
├─────────────┬───────────────────────────┤
│ 60% → LPs   │ Passive yield for providers│
│ 25% → Treasury│ Protocol operations      │
│ 10% → Stakers│ veToken rewards          │
│ 5%  → FSP   │ Gas subsidies             │
└─────────────┴───────────────────────────┘
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   USER LAYER                     │
│         MetaMask • WalletConnect • EIP-2771      │
└─────────────────────┬───────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│                  FRONTEND LAYER                  │
│           React + Vite + Tailwind CSS           │
└─────────────────────┬───────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│              SMART CONTRACT LAYER                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Router   │→ │ Pool     │  │ FeeCollector │  │
│  │ (Entry)  │  │ (AMM)    │  │ (60/25/10/5) │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│                BLOCKCHAIN LAYER                  │
│     Ethereum • Arbitrum • Optimism • Base       │
└─────────────────────────────────────────────────┘
```

## 📦 Smart Contracts

### Router (`Router.sol`)
Entry point for all DEX interactions
- `createPool()` - Initialize new trading pairs
- `addLiquidity()` - Provide liquidity and earn fees
- `swap()` - Execute token swaps

### Pool (`Pool.sol`)
AMM implementation with constant product formula `x * y = k`
- **Fee**: 0.3%
- **Formula**: `amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)`

### FeeCollector (`FeeCollector.sol`)
Distributes fees across ecosystem
- `collectFees()` - Gather accumulated fees
- `distributeFees()` - Split according to protocol parameters

## 🌐 Live Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| **Router** | `0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2` |
| **Pool** | `0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4` |
| **Token A (TKA)** | `0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f` |
| **Token B (TKB)** | `0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E` |
| **FeeCollector** | `0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1` |

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

## 🚀 Usage

### Local Development

```bash
# Start Hardhat node
npx hardhat node

# Deploy contracts (in separate terminal)
npx hardhat run scripts/deploy-clean.js --network localhost

# Launch frontend
cd frontend && npm run dev
```

### Sepolia Testnet

```bash
# Deploy with fee infrastructure
npx hardhat run scripts/deploy-sepolia-fees.js --network sepolia
```

## 📊 LP Management Scripts

```bash
# Add liquidity (1000 TKA + 1000 TKB)
npx hardhat run scripts/add-liquidity.mjs --network sepolia

# Check LP position and fees earned
npx hardhat run scripts/lp-breakdown.mjs --network sepolia

# Check balances and pool reserves
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia

# Swap 1 TKA for TKB
npx hardhat run scripts/test-sepolia-swap.mjs --network sepolia
```

## 📈 Revenue Model

| Daily Volume | Swap Fees | LP (60%) | Treasury (25%) | Stakers (10%) | FSP (5%) |
|--------------|-----------|----------|----------------|---------------|----------|
| $1M | $3,000 | $1,800 | $750 | $300 | $150 |
| $10M | $30,000 | $18,000 | $7,500 | $3,000 | $1,500 |
| $100M | $300,000 | $180,000 | $75,000 | $30,000 | $15,000 |

**Projected Annual Revenue (at $10M daily volume): ~$10.95M**

## 📁 Project Structure

```
tefa-dex/
├── contracts/
│   ├── Router.sol           # Main routing contract
│   ├── Pool.sol             # AMM liquidity pool
│   ├── FeeCollector.sol     # Fee distribution
│   └── MockERC20.sol        # Test tokens
├── scripts/
│   ├── add-liquidity.mjs    # Liquidity provision
│   ├── lp-breakdown.mjs     # LP analytics
│   ├── check-sepolia-balances.mjs
│   └── test-sepolia-swap.mjs
├── frontend/
│   └── src/
└── hardhat.config.ts
```

## 🗺️ Roadmap

### ✅ Phase 1: Core DEX (Complete)
- Router and Pool contracts
- Liquidity provision
- Swap functionality
- Frontend UI

### 🔄 Phase 2: Revenue Model (In Progress)
- Fee Collector (60/25/10/5 split)
- Treasury management
- Staking rewards

### 📅 Phase 3: Gasless Transactions (Upcoming)
- EIP-2771 TrustedForwarder
- Fee Subsidy Pool
- Relayer network

### 📅 Phase 4: Multi-Chain (Upcoming)
- Arbitrum deployment
- Optimism deployment
- Base deployment
- Cross-chain bridge

### 📅 Phase 5: Governance (Upcoming)
- $TEFA token launch
- DAO setup
- veToken model

## 🔒 Security

- ✅ ReentrancyGuard on external functions
- ✅ Slippage protection
- ✅ Deadline parameters
- ✅ Access control for admin functions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Uniswap V2 for AMM inspiration
- OpenZeppelin for secure contracts
- EIP-2771 for gasless transactions

## 📞 Contact

- **GitHub**: [@GeraldNdlovu](https://github.com/GeraldNdlovu)
- **Project Link**: [https://github.com/GeraldNdlovu/tefa-dex](https://github.com/GeraldNdlovu/tefa-dex)

---

<div align="center">
  <strong>Built with 🔥 by the TEFA Team</strong>
</div>
```

---

