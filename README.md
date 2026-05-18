# 🦁 TEFA DEX

**Gasless Decentralized Exchange on Sepolia**

A meta-transaction powered DEX enabling gas-free token swaps via ERC-2771, built with Solidity & Hardhat.

---

## 🌐 Live Deployment (Sepolia)

| Contract | Address |
|----------|---------|
| **TKA Token** | `0xe64F6E38F004eDE64756dd62d4F10Ce28721e155` |
| **TKB Token** | `0xa2a5CF99ae48dfAF190186f734142C6D17E887B9` |
| **Router** | `0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca` |
| **Pool** | `0xdc9869FA076BCC98f67996dcb9FFF9c3bb5aA802` |
| **Forwarder** | `0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d` |
| **Deployer Wallet** | `0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734` |

**Frontend:** [http://147.182.193.26:5173](http://147.182.193.26:5173)

**Current Pool State:**
- TKA Reserve: `1000.0`
- TKB Reserve: `1000.0`
- Total LP Shares: `1000.0`

---

## ✨ Features

- ⛽ **Gasless Swaps** — Users swap without holding ETH via ERC-2771 meta-transactions
- 📈 **Constant Product AMM** — `x * y = k` formula with 0.3% fee
- 🔐 **Fully Immutable** — No admin keys, no upgradeable proxies
- 🧱 **Modular Architecture** — Separate Pool, Router, and Token contracts
- 💰 **LP Shares** — Properly minted and tracked for liquidity providers
- 🌍 **Live on Sepolia** — Deployed, tested, and fully functional

---

## 📁 Project Structure

```
tefa-dex/
├── contracts/
│   ├── Pool.sol              # AMM pool (swap + LP share logic)
│   ├── Router.sol            # User-facing router (approvals + routing)
│   ├── MockERC20.sol         # Test ERC20 tokens
│   ├── TrustedForwarder.sol  # ERC-2771 forwarder for gasless txs
│   ├── FeeCollector.sol      # Collects & distributes swap fees
│   ├── Treasury.sol          # Protocol treasury
│   └── FeeSubsidyPool.sol    # Gas subsidy pool
├── scripts/
│   ├── deploy-sepolia-fixed.cjs   # Working deployment script
│   ├── check-sepolia-balances.mjs # View Sepolia balances & reserves
│   ├── test-sepolia-swap.js       # Execute test swap
│   └── check-router.js            # Verify Router contract
├── relayer/                 # Meta-transaction relayer service
├── frontend/                # React frontend (gasless wallet UI)
├── test/                    # Unit tests
├── hardhat.config.ts        # Hardhat configuration
└── .env                     # Private keys & API keys
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.24 |
| Framework | Hardhat |
| Libraries | OpenZeppelin (ERC-2771, ERC20) |
| Scripts | TypeScript / ESM |
| Frontend | React + Vite |
| Network | Sepolia Testnet |

---

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
```

### Compile

```bash
npx hardhat clean
npx hardhat compile
```

### Deploy to Sepolia

```bash
node deploy-sepolia-fixed.cjs
```

### Local Development

```bash
# Terminal 1 — Start local node
npx hardhat node

# Terminal 2 — Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 🔄 How It Works

### Add Liquidity
1. User approves Router to spend TKA and TKB
2. Router transfers tokens from user → Router
3. Router approves Pool to spend tokens
4. Pool pulls tokens from Router → Pool
5. Pool mints LP shares to user (proportional to contribution)

### Remove Liquidity
1. User calls Router.removeLiquidity with share amount
2. Router forwards to Pool.removeLiquidityFor
3. Pool calculates user's token amounts
4. Pool burns LP shares and transfers tokens back to user

### Swap
1. User approves Router to spend input token
2. Router transfers token in → Router
3. Router approves Pool
4. Pool calculates output using x*y=k formula with 0.3% fee
5. Pool sends output token to user

---

## 🧪 Testing

```bash
# View balances & pool reserves
npx hardhat run scripts/check-sepolia-balances.mjs --network sepolia

# Test a swap (1 TKA → TKB)
npx hardhat run scripts/test-sepolia-swap.js --network sepolia
```

---

## 🎨 Frontend

Launch the DEX UI:

```bash
cd frontend
npm install
npm run dev
```

Or access the live deployment at [http://147.182.193.26:5173](http://147.182.193.26:5173)

---

## 🔐 Security

- ✅ No admin keys — fully immutable contracts
- ✅ ERC-2771 signature verification for meta-txs
- ✅ Fee parameters hardcoded (0.3%)
- ✅ LP shares properly minted to users (not router)
- ⏳ Formal audit pending

---

## 📝 Environment Variables

Create `.env` in project root:

```env
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
```

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

## 👤 Author

**Gerald Ndlovu**

📧 Contact: [dumizo@yahoo.com](mailto:dumizo@yahoo.com)

GitHub: [@GeraldNdlovu](https://github.com/GeraldNdlovu)

---

*Built with 🔥 Hardhat. Swapping made gasless.*


```bash
git add README.md && git commit -m "docs: update README with working contract addresses and LP share fix" && git push origin main
```
