import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("\n========================================");
  console.log("🚀 Deploying TefaGaslessExecutor");
  console.log("========================================\n");
  console.log(`Deployer: ${deployer.address}`);

  // Existing deployed contracts
  const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";

  // Initial relayer wallet
  const RELAYER_ADDRESS = deployer.address;

  console.log(`Router: ${ROUTER_ADDRESS}`);
  console.log(`Initial Relayer: ${RELAYER_ADDRESS}\n`);

  // Deploy contract
  const Executor = await ethers.getContractFactory(
    "TefaGaslessExecutor"
  );

  const executor = await Executor.deploy(
    ROUTER_ADDRESS,
    RELAYER_ADDRESS
  );

  await executor.waitForDeployment();

  const executorAddress =
    await executor.getAddress();

  console.log(
    `✅ TefaGaslessExecutor deployed to: ${executorAddress}`
  );

  console.log("\n========================================");
  console.log("📋 Frontend Config");
  console.log("========================================");
  console.log(`GASLESS_EXECUTOR=${executorAddress}`);
  console.log("========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
