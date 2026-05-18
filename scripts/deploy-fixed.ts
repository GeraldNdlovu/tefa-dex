import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  console.log("\n========================================");
  console.log("🚀 TEFA DEX - LOCAL DEPLOYMENT");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // TrustedForwarder (no constructor args)
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  console.log(`✅ TrustedForwarder: ${await forwarder.getAddress()}`);

  // Tokens (name, symbol, supply)
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  console.log(`✅ TokenA (TKA): ${await tokenA.getAddress()}`);
  console.log(`✅ TokenB (TKB): ${await tokenB.getAddress()}`);

  // Router (takes forwarder address)
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(await forwarder.getAddress());
  await router.waitForDeployment();
  console.log(`✅ Router: ${await router.getAddress()}`);

  // Create Pool
  console.log("\n📦 Creating Pool...");
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`✅ Pool: ${poolAddr}`);

  // Add liquidity
  console.log("\n💰 Adding liquidity...");
  const amount = ethers.parseEther("10000");
  await tokenA.approve(await router.getAddress(), amount);
  await tokenB.approve(await router.getAddress(), amount);
  await router.addLiquidity(tokenAAddr, tokenBAddr, amount, amount);
  console.log("✅ Liquidity added: 10,000 TKA / 10,000 TKB");

  // Verify reserves
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n📊 Pool Reserves:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);

  console.log("\n========================================");
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
