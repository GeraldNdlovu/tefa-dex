import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load from relayer .env
dotenv.config({ path: 'relayer/.env' });

const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("❌ No private key in relayer/.env");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// The executor address from your deployment
const EXECUTOR_ADDRESS = "0xfA6e245B353934c6D9980b285F3660694764384c";
const USER_ADDRESS = await wallet.getAddress();

console.log("\n=== CONTRACT STATE ===");
console.log("Executor:", EXECUTOR_ADDRESS);
console.log("Wallet:", USER_ADDRESS);

const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function nonces(address) view returns (uint256)",
  "function trustedRelayer() view returns (address)",
  "function owner() view returns (address)"
], provider);

const [nonce, trustedRelayer, owner] = await Promise.all([
  executor.nonces(USER_ADDRESS),
  executor.trustedRelayer(),
  executor.owner()
]);

console.log("Nonce:", nonce.toString());
console.log("Trusted Relayer:", trustedRelayer);
console.log("Owner:", owner);

// Check if our wallet is the trusted relayer
const isTrusted = trustedRelayer.toLowerCase() === USER_ADDRESS.toLowerCase();
console.log("\nWallet is Trusted Relayer:", isTrusted ? "✅ YES" : "❌ NO");

if (!isTrusted) {
  console.log("\n⚠️  The contract's trustedRelayer is different from your wallet.");
  console.log("   This will cause 'bad sig' errors.");
  console.log("   To fix, run: await executor.updateRelayer(USER_ADDRESS) as owner");
}

// EIP-712 domain
const domain = {
  name: 'TefaGaslessExecutor',
  version: '1',
  chainId: 11155111,
  verifyingContract: EXECUTOR_ADDRESS
};

const types = {
  Swap: [
    { name: 'user', type: 'address' },
    { name: 'tokenIn', type: 'address' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'tokenOut', type: 'address' },
    { name: 'minOut', type: 'uint256' },
    { name: 'relayerFeeAmount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

const swap = {
  user: USER_ADDRESS,
  tokenIn: "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155",
  amountIn: ethers.parseEther("0.001"),
  tokenOut: "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9",
  minOut: 0,
  relayerFeeAmount: 0,
  nonce: nonce,
  deadline: Math.floor(Date.now() / 1000) + 3600
};

console.log("\n=== SIGNING ===");
console.log("Domain:", domain);
console.log("Swap nonce:", swap.nonce);

const signature = await wallet.signTypedData(domain, types, swap);
console.log("Signature:", signature.slice(0, 70) + "...");

// Verify locally
const recovered = ethers.verifyTypedData(domain, types, swap, signature);
console.log("\n=== LOCAL VERIFICATION ===");
console.log("Recovered:", recovered);
console.log("Expected:", USER_ADDRESS);
console.log("Match:", recovered.toLowerCase() === USER_ADDRESS.toLowerCase() ? "✅" : "❌");

if (recovered.toLowerCase() !== USER_ADDRESS.toLowerCase()) {
  console.error("\n❌ Local verification failed - signature is invalid");
  process.exit(1);
}

// Submit to relayer
console.log("\n=== SUBMITTING TO RELAYER ===");
const response = await fetch('http://localhost:3001/api/gasless/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: USER_ADDRESS,
    swap: {
      user: swap.user,
      tokenIn: swap.tokenIn,
      amountIn: swap.amountIn.toString(),
      tokenOut: swap.tokenOut,
      minOut: swap.minOut.toString(),
      relayerFeeAmount: swap.relayerFeeAmount.toString(),
      nonce: swap.nonce.toString(),
      deadline: swap.deadline.toString()
    },
    signature
  })
});

const result = await response.json();
console.log("Relayer response:", result);
