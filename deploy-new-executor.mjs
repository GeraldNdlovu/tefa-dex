import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privateKey = process.env.PRIVATE_KEY || process.env.RELAYER_PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ No private key found in .env");
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey, provider);
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";

console.log("Deploying new TefaGaslessExecutor...");
console.log("Deployer:", wallet.address);
console.log("Router:", ROUTER_ADDRESS);

const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json", "utf8"));
const Executor = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

const executor = await Executor.deploy(ROUTER_ADDRESS, wallet.address);
await executor.waitForDeployment();
const executorAddr = await executor.getAddress();

console.log("\n✅ New Executor deployed to:", executorAddr);
console.log("\n📋 Update your frontend and relayer .env with:");
console.log(`EXECUTOR_ADDRESS=${executorAddr}`);
