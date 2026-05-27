import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

// Load from relayer/.env
dotenv.config({ path: './relayer/.env' });

console.log("=== Environment Debug ===");
console.log("Env file: ./relayer/.env");
console.log("Has PRIVATE_KEY:", !!(process.env.PRIVATE_KEY));
console.log("Has RELAYER_PRIVATE_KEY:", !!(process.env.RELAYER_PRIVATE_KEY));
console.log("Has RPC_URL:", !!process.env.RPC_URL);
console.log("=======================\n");

const privateKey = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";

// Validation
if (!privateKey) throw new Error("Missing private key in relayer/.env");
if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
  throw new Error("Private key must be 0x + 64 hex chars");
}
if (!RPC_URL) throw new Error("Missing RPC_URL in relayer/.env");

// Find artifact
const possiblePaths = [
  "artifacts/contracts/TefaGaslessExecutorFixed.sol/TefaGaslessExecutor.json",
  "artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json"
];

let artifactPath = null;
for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    artifactPath = path;
    break;
  }
}

if (!artifactPath) {
  console.error("❌ Artifact not found. Run: npx hardhat compile");
  process.exit(1);
}

console.log(`📁 Artifact: ${artifactPath}`);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);

console.log(`✅ Deployer: ${wallet.address}`);
console.log(`   Router: ${ROUTER_ADDRESS}\n`);

console.log("🚀 Deploying...");
const Executor = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const executor = await Executor.deploy(ROUTER_ADDRESS, wallet.address);
await executor.waitForDeployment();
const executorAddr = await executor.getAddress();

console.log("\n✅ Deployed to:", executorAddr);
console.log("\n📋 Update relayer/.env:");
console.log(`EXECUTOR_ADDRESS=${executorAddr}`);
