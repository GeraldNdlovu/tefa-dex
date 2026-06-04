const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("🚀 TEFA DEX - SEPOLIA DEPLOYMENT");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy Tokens
  console.log("📦 Deploying Tokens...");
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`   ✅ TKA: ${tokenAAddr}`);
  console.log(`   ✅ TKB: ${tokenBAddr}`);

  // Deploy Forwarder
  console.log("\n📦 Deploying Forwarder...");
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`   ✅ Forwarder: ${forwarderAddr}`);

  // Deploy Router
  console.log("\n📦 Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   ✅ Router: ${routerAddr}`);

  // Create Pool
  console.log("\n📦 Creating Pool...");
  await router.createPool(tokenAAddr, tokenBAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`   ✅ Pool: ${poolAddr}`);

  // Approve and Add Liquidity
  console.log("\n💧 Adding Liquidity...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));
  await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  console.log(`   ✅ Liquidity added: 10,000 TKA / 10,000 TKB`);

  // Update frontend config
  const configPath = path.join(__dirname, "../frontend/src/config/contracts.ts");
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configContent = `// AUTO-GENERATED from Sepolia deployment
export const CONTRACT_ADDRESSES = {
  ROUTER: "${routerAddr}",
  TKA: "${tokenAAddr}",
  TKB: "${tokenBAddr}",
  POOL: "${poolAddr}",
  FORWARDER: "${forwarderAddr}"
};`;

  fs.writeFileSync(configPath, configContent);
  console.log("\n✅ Frontend config updated!");

  console.log("\n========================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log(`\n📌 Use these addresses in your frontend:`);
  console.log(`   TKA: ${tokenAAddr}`);
  console.log(`   TKB: ${tokenBAddr}`);
  console.log(`   Router: ${routerAddr}`);
  console.log(`   Pool: ${poolAddr}`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed!");
  console.error(error);
  process.exitCode = 1;
});
