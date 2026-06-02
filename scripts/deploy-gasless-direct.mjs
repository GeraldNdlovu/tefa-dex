import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // Get provider and signer from Hardhat network
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // Load private key from .env
  import('dotenv').then(dotenv => dotenv.config());
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in .env");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  const deployer = wallet;
  
  console.log("\n========================================");
  console.log("🚀 Deploying TefaGaslessExecutor");
  console.log("========================================\n");
  console.log(`Deployer: ${deployer.address}`);
  
  // Your existing deployed contracts
  const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
  const RELAYER_ADDRESS = deployer.address;
  
  console.log(`Router: ${ROUTER_ADDRESS}`);
  console.log(`Initial Relayer: ${RELAYER_ADDRESS}\n`);
  
  // Get contract factory from artifacts
  const executorArtifact = await import('../artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json', { assert: { type: 'json' } });
  const Executor = new ethers.ContractFactory(executorArtifact.default.abi, executorArtifact.default.bytecode, wallet);
  
  const executor = await Executor.deploy(ROUTER_ADDRESS, RELAYER_ADDRESS);
  await executor.waitForDeployment();
  
  console.log(`✅ TefaGaslessExecutor deployed to: ${await executor.getAddress()}`);
  console.log("\n========================================");
  console.log("📋 Update your frontend with:");
  console.log(`GASLESS_EXECUTOR: ${await executor.getAddress()}`);
  console.log("========================================\n");
}

main().catch(console.error);
