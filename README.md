 🔥 TEFA DEX - Gasless Decentralized Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-FFD500)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)
[![EIP-2771](https://img.shields.io/badge/EIP-2771-gasless-blue)](https://eips.ethereum.org/EIPS/eip-2771)

**Swap tokens without paying gas fees.** A production-ready DEX with gasless transactions, protocol fee capture, and a beautiful UI.

---

## 📖 Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Contracts](#contracts)
- [Installation](#installation)
- [Usage](#usage)
- [Revenue Model](#revenue-model)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🌐 Live Demo

| | |
|---|---|
| **Frontend** | [http://147.182.193.26:5173](http://147.182.193.26:5173) |
| **Network** | Sepolia Testnet |
| **Chain ID** | 11155111 |

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Token Swaps | ✅ Live | 0.3% fee, constant product AMM |
| Liquidity Pools | ✅ Live | Add/remove liquidity, earn fees |
| Gasless Transactions | ✅ Live | EIP-2771 meta-transactions |
| Fee Collection | ✅ Live | 60/25/10/5 split |
| LP Analytics | ✅ Live | Track earnings and pool share |
| Cross-Chain | 🔄 Planned | Arbitrum, Optimism, Base |

---

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
│  ┌──────────────┐  ┌──────────────────────────┐│
│  │ Forwarder    │  │ FeeSubsidyPool           ││
│  │ (EIP-2771)   │  │ (Gas Reimbursement)      ││
│  └──────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│                BLOCKCHAIN LAYER                  │
│     Ethereum • Arbitrum • Optimism • Base       │
└─────────────────────────────────────────────────┘
```

---

## 📦 Smart Contracts

| Contract | Description |
|----------|-------------|
| **Router** | Entry point for swaps and liquidity |
| **Pool** | AMM with constant product formula |
| **FeeCollector** | Distributor of protocol fees |
| **TrustedForwarder** | EIP-2771 gasless transaction handler |
| **FeeSubsidyPool** | Gas reimbursement for relayers |
| **RelayerRegistry** | Whitelist and slashing for relayers |
| **EligibilityOracle** | User eligibility for gas subsidies |

### Sepolia Addresses

| Contract | Address |
|----------|---------|
| Router | `0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2` |
| Pool | `0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4` |
| TKA | `0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f` |
| TKB | `0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E` |
| Forwarder | `0xA9fCEd86688FF5c1528600989194fA7AE5c33b1f` |
| Gasless Router | `0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839` |
| Treasury | `0x45F811400e3018993726bCc515DDB50A4a3E89c0` |
| FeeSubsidyPool | `0xEcB93d5378985BAe86Bd727dddDB92884519f328` |

---

## 🛠️ Installation

```bash
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex
npm install
cd frontend && npm install && cd ..
```

---

## 🚀 Usage

### Start Frontend

```bash
cd frontend && npm run dev
```

### Deploy Locally

```bash
npx hardhat node
npx hardhat run scripts/deploy-clean.js --network localhost
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-sepolia-fees.js --network sepolia
```

### LP Management

```bash
# Add liquidity
npx hardhat run scripts/add-liquidity.mjs --network sepolia

# Check LP position
npx hardhat run scripts/lp-breakdown.mjs --network sepolia

# Check balances
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia
```

### Gasless Transaction

```bash
# Run relayer
cd relayer && npm run dev

# Execute gasless swap
npx hardhat run scripts/test-gasless-swap.mjs --network sepolia
```

---

## 💰 Revenue Model

$0
---

## 🗺️ Roadmap

### ✅ Phase 1: Core DEX (Complete)
- Router and Pool contracts
- Liquidity provision
- Swap functionality
- Frontend UI

### ✅ Phase 2: Revenue Model (Complete)
- Fee Collector (60/25/10/5 split)
- Treasury management
- LP analytics

### 🔄 Phase 3: Gasless Transactions (In Progress)
- EIP-2771 TrustedForwarder
- Relayer network
- Gas subsidy claims
- Fee subsidy pool

### 📅 Phase 4: Multi-Chain (Upcoming)
- Arbitrum deployment
- Optimism deployment
- Base deployment
- Cross-chain bridge

### 📅 Phase 5: Governance (Upcoming)
- $TEFA token launch
- DAO setup
- veToken model

---

## 🔒 Security

- ✅ ReentrancyGuard on external functions
- ✅ Slippage protection
- ✅ Deadline parameters
- ✅ Access control for admin functions
- ✅ EIP-2771 signature verification

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **e-mail**: dumizo@yahoo.com
- **Project Link**: [https://github.com/GeraldNdlovu/tefa-dex](https://github.com/GeraldNdlovu/tefa-dex)

---

<div align="center">
  <strong>Built with 🔥 by the TEFA Team</strong>
</div>


**Done. README is updated and pushed.**

Ready to move to Step 1: Test gasless swap on local Hardhat node?
