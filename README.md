TEFA DEX – Gasless Multi‑Chain Exchange

A fully functional decentralised exchange (DEX) that uses **meta‑transactions (gasless swaps)**.  
Users sign messages; the relayer pays gas and submits transactions. No ETH required for trading.

---

🔥 Live (Sepolia testnet)

**Main URL:** https://dex.147.182.193.26.nip.io  
*Accept the self‑signed certificate warning.*

---

## 📦 Core Components

| Component          | Path                     | What it does                                |
|--------------------|--------------------------|---------------------------------------------|
| **Frontend**       | `/frontend`              | React + Vite + Tailwind UI                  |
| **Relayer (API)**  | `/relayer/src/server.cjs`| Handles admin auth, swap queue, metrics     |
| **Relayer Worker** | `/relayer/src/worker.cjs`| Processes swaps (BullMQ + Redis)            |
| **Smart Contracts**| `/contracts`             | Executor, Router, Test tokens (Sepolia)     |

---

## 🚀 Running the DEX

### 1. Start relayer backend
```bash
cd /root/tefa-dex/relayer
PORT=3001 node src/server.cjs &
node src/worker.cjs &
```

### 2. Start frontend
```bash
cd /root/tefa-dex/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### 3. Nginx proxy (HTTPS)
- API routes (`/api/*`, `/metrics`) → `localhost:3001`
- Everything else → `localhost:5173`

---

## 👑 Admin Dashboard

Connect with one of the authorised admin wallets:

- `0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734`
- `0x46980BC901a04B9AD24E86a4d76eCd7c45df6ca4`

**Features:**
- Relayer balance & queue status
- Recent swap jobs
- Success/failure rates
- Contract addresses (Sepolia)

---

## 🧪 Sepolia Contracts

| Contract       | Address                                                                               |
|----------------|---------------------------------------------------------------------------------------|
| Gasless Executor | `0xfA6e245B353934c6D9980b285F3660694764384c`                                         |
| Router         | `0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca`                                         |
| Pool (TKA/TKB) | `0xdc9869FA8768CC98f67996dcb9FFF9c3bb5aA802`                                         |
| Relayer Wallet | `0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734`                                         |

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind, Ethers, Recharts
- **Backend:** Node.js, Express, BullMQ, Redis, SIWE
- **Blockchain:** Ethereum Sepolia, Hardhat
- **Process Manager:** PM2
- **Proxy:** Nginx

---

## 📁 Project Structure (after cleanup)

```
tefa-dex/
├── frontend/           # React DEX UI
│   ├── src/
│   └── package.json
├── relayer/            # Gasless relayer
│   ├── src/
│   │   ├── server.cjs
│   │   └── worker.cjs
│   └── .env
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment helpers
├── ignition/           # Hardhat ignition modules
├── artifacts/ & cache/ # Build outputs
└── README.md
```

---

## 👤 Author & Support

Built for Sepolia testnet.  
For issues or feature requests, open a GitHub issue.

**⚠️ Self‑signed certificate:** The live domain uses a self‑signed SSL certificate. Your browser will ask for confirmation – accept it to proceed.

---

## 📄 License

MIT
