import { ethers } from "hardhat";

async function main() {
  console.log("\n========================================");
  console.log("🚀 TEFA DEX - LOCAL DEPLOYMENT");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy TrustedForwarder
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`✅ TrustedForwarder: ${forwarderAddr}`);

  // Deploy Tokens
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`✅ TokenA (TKA): ${tokenAAddr}`);
  console.log(`✅ TokenB (TKB): ${tokenBAddr}`);

  // Deploy Router
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`✅ Router: ${routerAddr}`);

  // Create Pool
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`✅ Pool: ${poolAddr}`);

  // Approve and add liquidity
  console.log("\n💰 Approving tokens...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));

  console.log("💧 Adding initial liquidity...");
  await router.addLiquidity(
    tokenAAddr,
    tokenBAddr,
    ethers.parseEther("10000"),
    ethers.parseEther("10000")
  );

  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("========================================");
  console.log(`Router: ${routerAddr}`);
  console.log(`TokenA: ${tokenAAddr}`);
  console.log(`TokenB: ${tokenBAddr}`);
  console.log(`Pool: ${poolAddr}`);
  console.log(`Forwarder: ${forwarderAddr}`);
  console.log("========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
