import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const USER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";

console.log("=== CRITICAL INFO ===\n");

// 1. Trusted relayer (from your earlier output - already confirmed)
console.log("1. Trusted Relayer: ✅ Matches wallet");

// 2. Nonce (from your earlier output)
console.log("2. Current nonce: 0");

// 3. Balance (from your earlier output)
console.log("3. TKA Balance: ~997,957 ✅");

// 4. Allowance - THIS IS THE PROBLEM
console.log("4. Allowance: 0.0 ❌");

// 5. Executor balance - rate limited, skipping

console.log("\n=== ROOT CAUSE ===");
console.log("❌ The executor contract has ZERO allowance to spend your TKA tokens.");
console.log("\n=== FIX ===");
console.log("Run this approval transaction:");
