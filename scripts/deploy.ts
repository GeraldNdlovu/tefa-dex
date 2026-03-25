import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  console.log("✅ ethers loaded");

  const [deployer] = await ethers.getSigners();

  // Deploy Forwarder
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("✅ TrustedForwarder:", forwarderAddr);

  // Deploy Tokens
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  console.log("✅ TokenA:", await tokenA.getAddress());
  console.log("✅ TokenB:", await tokenB.getAddress());

  // Deploy Router
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("✅ Router:", routerAddr);

  // Create Pool
  const tx = await router.createPool(await tokenA.getAddress(), await tokenB.getAddress());
  await tx.wait();
  const poolAddr = await router.getPool(await tokenA.getAddress(), await tokenB.getAddress());
  console.log("✅ Pool:", poolAddr);

  // Approve Router
  console.log("Approving Router to spend tokens...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));

  // Add liquidity
  await router.addLiquidity(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    ethers.parseEther("10000"),
    ethers.parseEther("10000")
  );

  // ===== ADD THIS CHECK =====
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log("\n📊 Pool Reserves:");
  console.log("TokenA in pool:", ethers.formatEther(reserve0));
  console.log("TokenB in pool:", ethers.formatEther(reserve1));
  // =========================

  console.log("\n🎉 TEFA DEX deployed and seeded successfully!");
  console.log("Router Address:", routerAddr);
  console.log("TokenA:", await tokenA.getAddress());
  console.log("TokenB:", await tokenB.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
