const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in .env");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("\n========================================");
  console.log("🚀 Deploying TefaGaslessExecutor");
  console.log("========================================\n");
  console.log(`Deployer: ${wallet.address}`);
  
  const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
  const RELAYER_ADDRESS = wallet.address;
  
  console.log(`Router: ${ROUTER_ADDRESS}`);
  console.log(`Initial Relayer: ${RELAYER_ADDRESS}\n`);
  
  // Load artifact
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json", "utf8"));
  const Executor = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  const executor = await Executor.deploy(ROUTER_ADDRESS, RELAYER_ADDRESS);
  await executor.waitForDeployment();
  const executorAddr = await executor.getAddress();
  
  console.log(`✅ TefaGaslessExecutor deployed to: ${executorAddr}`);
  console.log("\n========================================");
  console.log("📋 Update your frontend with:");
  console.log(`GASLESS_EXECUTOR: ${executorAddr}`);
  console.log("========================================\n");
}

main().catch(console.error);
