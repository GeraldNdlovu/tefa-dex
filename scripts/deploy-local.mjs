import hre from "hardhat";

async function main() {
  console.log("\n========================================");
  console.log("🚀 TEFA DEX - LOCAL DEPLOYMENT");
  console.log("========================================\n");

  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy TrustedForwarder (no constructor args)
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`✅ TrustedForwarder: ${forwarderAddr}`);

  // Deploy Tokens (name, symbol, initialSupply)
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`✅ TokenA (TKA): ${tokenAAddr}`);
  console.log(`✅ TokenB (TKB): ${tokenBAddr}`);

  // Deploy Router (takes trustedForwarder address)
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`✅ Router: ${routerAddr}`);

  // Create Pool (takes token addresses)
  console.log("\n📦 Creating Pool...");
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`✅ Pool: ${poolAddr}`);

  // Approve Router to spend tokens
  console.log("\n💰 Approving Router...");
  const amount = ethers.parseEther("10000");
  await tokenA.approve(routerAddr, amount);
  await tokenB.approve(routerAddr, amount);
  console.log("✅ Approvals complete");

  // Add initial liquidity
  console.log("💧 Adding initial liquidity...");
  await router.addLiquidity(tokenAAddr, tokenBAddr, amount, amount);
  console.log("✅ Liquidity added");

  // Get pool reserves
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n📊 Pool Reserves:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);

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
