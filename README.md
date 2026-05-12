# 🔥 TEFA DEX - Decentralized Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-FFD500)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://reactjs.org/)
[![Network](https://img.shields.io/badge/Network-Sepolia-8A2BE2)](https://sepolia.etherscan.io/)

**A production-ready decentralized exchange built on Uniswap V2 AMM model.**

---

## 🌐 Live Demo

| | |
|---|---|
| **Frontend** | http://147.182.193.26:5173 |
| **Network** | Sepolia Testnet |
| **Chain ID** | 11155111 |

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Token Swaps | ✅ Live | 0.3% fee, constant product AMM |
| Liquidity Pools | ✅ Live | Add/remove liquidity, earn fees |
| Fee Collection | ✅ Live | 60/25/10/5 split |
| LP Analytics | ✅ Live | Track earnings and pool share |

---

## 📍 Live Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| **Router** | `0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2` |
| **Pool** | `0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4` |
| **Token A (TKA)** | `0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f` |
| **Token B (TKB)** | `0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E` |
| **FeeCollector** | `0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1` |

---

## 🛠️ Installation

```bash
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex
npm install
cd frontend && npm install && cd ..
# Add liquidity (1000 TKA + 1000 TKB)
npx hardhat run scripts/add-liquidity.mjs --network sepolia

# Check LP position and fees earned
npx hardhat run scripts/lp-breakdown.mjs --network sepolia

# Check balances and pool reserves
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia

# Swap 1 TKA for TKB
npx hardhat run scripts/test-sepolia-swap.mjs --network sepolia
💰 Revenue Model
Daily Volume	Swap Fees	LP (60%)	Treasury (25%)	Stakers (10%)	FSP (5%)
$1M	$3,000	$1,800	$750	$300	$150
$10M	$30,000	$18,000	$7,500	$3,000	$1,500
$100M	$300,000	$180,000	$75,000	$30,000	$15,000
🗺️ Roadmap
✅ Phase 1: Core DEX (Complete)
Router and Pool contracts

Liquidity provision

Swap functionality

Frontend UI

🔄 Phase 2: Revenue Model (In Progress)
Fee Collector (60/25/10/5 split)

Treasury management

Staking rewards

📅 Phase 3: Gasless Transactions (Upcoming)
EIP-2771 TrustedForwarder

Fee Subsidy Pool

Relayer network

📅 Phase 4: Multi-Chain (Upcoming)
Arbitrum, Optimism, Base deployment

Cross-chain bridge

📅 Phase 5: Governance (Upcoming)
$TEFA token launch

DAO setup

📄 License
MIT License - see LICENSE file

📞 Contact
GitHub: @GeraldNdlovu

<div align="center"> <strong>Built with 🔥 by the TEFA Team</strong> </div> ```
