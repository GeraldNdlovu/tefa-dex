import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  
  console.log("\n========================================");
  console.log("🚀 Deploying TefaGaslessExecutor");
  console.log("========================================\n");
  console.log(`Deployer: ${deployer.address}`);
  
  // Your existing deployed contracts
  const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
  const RELAYER_ADDRESS = deployer.address; // Or your relayer wallet address
  
  console.log(`Router: ${ROUTER_ADDRESS}`);
  console.log(`Initial Relayer: ${RELAYER_ADDRESS}\n`);
  
  // Deploy TefaGaslessExecutor
  const Executor = await ethers.getContractFactory("TefaGaslessExecutor");
  const executor = await Executor.deploy(ROUTER_ADDRESS, RELAYER_ADDRESS);
  await executor.waitForDeployment();
  
  console.log(`✅ TefaGaslessExecutor deployed to: ${await executor.getAddress()}`);
  console.log("\n========================================");
  console.log("📋 Update your frontend with:");
  console.log(`GASLESS_EXECUTOR: ${await executor.getAddress()}`);
  console.log("========================================\n");
}

main().catch(console.error);
