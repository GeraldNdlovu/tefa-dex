# 🦁 TEFA DEX

**Gasless Decentralized Exchange on Sepolia**

A meta-transaction powered DEX enabling gas-free token swaps via ERC-2771, built with Solidity & Hardhat.

---

## 🌐 Live Deployment (Sepolia)

| Contract | Address |
|---|---|
| TKA Token | `0x6644F8db48e76c54033D332304F6922aE962eD2C` |
| TKB Token | `0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB` |
| Router | `0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2` |
| Wallet | `0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734` |

**Live Pool Reserves:**  
`TKA: 12,512.0` | `TKB: 7,997.45` | `ETH: 3.46 ETH`

---

## ✨ Features

- ⛽ **Gasless Swaps** — Users swap without holding ETH via ERC-2771 meta-transactions
- 📈 **Constant Product AMM** — `x * y = k` formula with 0.3% fee
- 🔐 **Fully Immutable** — No admin keys, no upgradeable proxies
- 💰 **Fee Distribution** — FeeCollector + Treasury for protocol revenue
- 🧱 **Modular Architecture** — Separate Pool, Router, and Token contracts
- 🌍 **Live on Sepolia** — Deployed, tested, and fully functional

---

## 📁 Project Structure

```
tefa-dex/
├── contracts/
│   ├── Pool.sol              # AMM pool (swap + liquidity logic)
│   ├── Router.sol            # User-facing router (approvals + routing)
│   ├── MockERC20.sol         # Test ERC20 tokens
│   ├── TrustedForwarder.sol  # ERC-2771 forwarder for gasless txs
│   ├── FeeCollector.sol      # Collects & distributes swap fees
│   ├── Treasury.sol          # Protocol treasury
│   └── FeeSubsidyPool.sol    # Gas subsidy pool
├── scripts/
│   ├── deploy.ts                   # Main deployment script
│   ├── check-sepolia-balances.mjs  # View Sepolia balances & reserves
│   ├── test-sepolia-swap.js        # Execute test swap
│   └── check-router.js             # Verify Router contract
├── relayer/                 # Meta-transaction relayer service
├── frontend/                # React frontend (gasless wallet UI)
├── test/                    # Unit tests
├── hardhat.config.ts        # Hardhat configuration
└── .env                     # Private keys & API keys
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24 |
| Framework | Hardhat |
| Libraries | OpenZeppelin (ERC-2771, ERC20) |
| Scripts | TypeScript |
| Frontend | React |
| Network | Sepolia Testnet |

---

## 🏁 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **MetaMask** (for Sepolia interaction)

### Installation

```bash
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex
npm install
```

### Compile

```bash
npx hardhat clean
npx hardhat compile
```

### Local Development

```bash
# Terminal 1 — Start local node
npx hardhat node

# Terminal 2 — Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Verify Contracts

```bash
npx hardhat verify --network sepolia <ADDRESS> <ARGS>
```

---

## 🔄 Swap Architecture

```
User approves Router
       ↓
Router pulls tokens from User → Router
       ↓
Router approves Pool to spend tokens
       ↓
Pool pulls tokens from Router → Pool reserves
       ↓
Pool calculates output: (amountIn × 0.997 × reserveOut) / (reserveIn + amountIn × 0.997)
       ↓
Pool sends output tokens to User
       ↓
0.3% fee → FeeCollector → Treasury
```

---

## 🧪 Testing

```bash
# View Sepolia balances & pool reserves
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia

# Test a swap (1 TKA → TKB)
npx hardhat run scripts/test-sepolia-swap.js --network sepolia

# Inspect Router contract
npx hardhat run scripts/check-router.js --network sepolia
```

### Verified Test Results (Sepolia)

```
✅ TKA balance before: 987,488.0
✅ TKA balance after:  987,487.0
✅ Pool reserves: 12,512 TKA | 7,997.45 TKB
✅ Swap successful!
```

---

## 🎨 Frontend

Launch the gasless DEX UI:

```bash
cd frontend
npm install
npm run dev
```

Connects to deployed Sepolia contracts with meta-transaction support.

---

## 🔐 Security

- ✅ No admin keys — fully immutable contracts
- ✅ ERC-2771 signature verification for meta-txs
- ✅ Fee parameters hardcoded (0.3%)
- ⏳ Formal audit pending (see [SECURITY.md](SECURITY.md))

---

## 📝 Environment Variables

Create `.env` in project root:

```env
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
TKA_ADDRESS=0x6644F8db48e76c54033D332304F6922aE962eD2C
TKB_ADDRESS=0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB
ROUTER_ADDRESS=0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2
```

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

## 👤 Author

**Gerald Ndlovu**

[![GitHub](https://img.shields.io/badge/GitHub-GeraldNdlovu-181717?style=flat&logo=github)](https://github.com/GeraldNdlovu)
[![Repo](https://img.shields.io/badge/Repo-tefa--dex-blue?style=flat&logo=github)](https://github.com/GeraldNdlovu/tefa-dex)

📧 **Contact:** [dumizo@yahoo.com](mailto:dumizo@yahoo.com)

---

*Built with 🔥 Hardhat. Swapping made gasless.*
