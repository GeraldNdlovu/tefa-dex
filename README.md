
# TEFA DEX 🦁

A gasless, meta-transaction powered decentralized exchange built with Solidity and Hardhat. Deployed on **Sepolia testnet** with live token pairs (TKA/TKB) and a working swap interface.

## 🚀 Live Deployment (Sepolia)

| Contract | Address |
|---|---|
| **TKA Token** | *(from your .env)* |
| **TKB Token** | *(from your .env)* |
| **Router** | `0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2` |
| **Pool (TKA/TKB)** | *(check via `getPool` on Router)* |
| **Wallet** | `0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734` |

**Pool Reserves (live):**
- TKA: `12,512.0`
- TKB: `7,997.4467`
- Sepolia ETH: `3.4637 ETH`

## ✨ Features

- **Gasless Transactions** — Users can swap without holding ETH for gas via ERC-2771 meta-transactions
- **Constant Product AMM** — Classic x*y=k formula with 0.3% fee
- **Meta-transaction Support** — TrustedForwarder for gasless UX
- **Fee Distribution** — FeeCollector and Treasury contracts for protocol revenue
- **Router Architecture** — Modular design separating Pool, Router, and Token contracts
- **Live on Sepolia** — Fully deployed and tested on Ethereum Sepolia testnet
- **Frontend Ready** — React frontend in `/frontend` directory

## 📁 Project Structure
tefa-dex/
├── contracts/ # Solidity smart contracts
│ ├── Pool.sol # AMM pool with swap & liquidity logic
│ ├── Router.sol # User-facing router (handles approvals & routing)
│ ├── MockERC20.sol # Test tokens
│ ├── TrustedForwarder.sol # ERC-2771 meta-tx forwarder
│ ├── FeeCollector.sol # Fee distribution contract
│ ├── Treasury.sol # Protocol treasury
│ └── FeeSubsidyPool.sol
├── scripts/ # Deployment & testing scripts
│ ├── deploy.ts # Main deployment script
│ ├── check-sepolia-balances.mjs # View Sepolia balances
│ ├── test-sepolia-swap.js # Test swap on Sepolia
│ └── check-router.js # Verify Router contract
├── relayer/ # Meta-transaction relayer service
├── frontend/ # React frontend application
├── test/ # Unit tests
├── hardhat.config.ts # Hardhat configuration
└── .env # Environment variables (private keys, API keys)

text

## 🛠 Tech Stack

- **Solidity 0.8.24** — Smart contracts
- **Hardhat** — Development environment
- **OpenZeppelin** — ERC-2771, ERC20 interfaces
- **TypeScript** — Deployment scripts
- **React** — Frontend UI (gasless wallet integration)

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask (for Sepolia)

### Installation

```bash
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex
npm install
Compile Contracts
bash
npx hardhat clean
npx hardhat compile
Local Testing
bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat run scripts/deploy.ts --network localhost
Deploy to Sepolia
bash
# Ensure .env has PRIVATE_KEY and ETHERSCAN_API_KEY
npx hardhat run scripts/deploy.ts --network sepolia
Verify on Etherscan
bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
🔄 Swap Workflow (How It Works)
User approves Router to spend their tokens (TKA or TKB)

Router pulls tokens from user → Router address

Router approves the specific Pool to spend those tokens

Pool pulls tokens from Router → Pool reserves

Pool calculates output using constant product formula: (amountIn * 0.997 * reserveOut) / (reserveIn + amountIn * 0.997)

Pool sends output tokens to user

0.3% fee is sent to FeeCollector for distribution

📊 Test Results (Sepolia)
text
✅ Swap 1 TKA → TKB successful
  TKA balance before: 987,488.0
  TKA balance after:  987,487.0
  Pool: 12,512 TKA / 7,997.45 TKB
🧪 Testing Scripts
bash
# Check Sepolia balances and pool reserves
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia

# Execute a test swap (1 TKA for TKB)
npx hardhat run scripts/test-sepolia-swap.js --network sepolia

# Check Router contract details
npx hardhat run scripts/check-router.js --network sepolia
🎨 Frontend
The React frontend in /frontend connects to the deployed contracts and supports gasless transactions via the relayer service.

bash
cd frontend
npm install
npm run dev
🔐 Security
No admin keys or upgradeable proxies — fully immutable

ERC-2771 meta-transactions use signature verification

Fee parameters are hardcoded (0.3%)

Security audit pending (see SECURITY.md)

📝 Environment Variables
Create a .env file:

env
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
TKA_ADDRESS=0x...  # Your TKA token address
TKB_ADDRESS=0x...  # Your TKB token address
ROUTER_ADDRESS=0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2
📜 License
MIT — see LICENSE file

👤 Author

GitHub: @GeraldNdlovu
Contact: dumizo@yahoo.com

Repo: tefa-dex
