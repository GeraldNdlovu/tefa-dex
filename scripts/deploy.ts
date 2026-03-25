import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log("✅ TokenA:", tokenAAddr);
  console.log("✅ TokenB:", tokenBAddr);

  // Deploy Router
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("✅ Router:", routerAddr);

  // Create Pool
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("✅ Pool:", poolAddr);

  // Approve Router
  console.log("Approving Router to spend tokens...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));

  // Add liquidity
  await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));

  // Check reserves
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log("\n📊 Pool Reserves:");
  console.log("TokenA in pool:", ethers.formatEther(reserve0));
  console.log("TokenB in pool:", ethers.formatEther(reserve1));

  // =============================================
  // 🚀 AUTO-UPDATE FRONTEND CONFIG
  // =============================================
  const configPath = path.join(__dirname, "../frontend/src/config/contracts.ts");
  
  // Ensure directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configContent = `// AUTO-GENERATED from deployment - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}
export const CONTRACT_ADDRESSES = {
  ROUTER: "${routerAddr}",
  TOKEN_A: "${tokenAAddr}",
  TOKEN_B: "${tokenBAddr}",
  FORWARDER: "${forwarderAddr}",
  POOL: "${poolAddr}"
};`;

  fs.writeFileSync(configPath, configContent);
  console.log("\n✅ Frontend config automatically updated at:", configPath);
  console.log("   Addresses written:");
  console.log(`   ROUTER: ${routerAddr}`);
  console.log(`   TOKEN_A: ${tokenAAddr}`);
  console.log(`   TOKEN_B: ${tokenBAddr}`);
  console.log(`   FORWARDER: ${forwarderAddr}`);
  console.log(`   POOL: ${poolAddr}`);

  console.log("\n🎉 TEFA DEX deployed and seeded successfully!");
  console.log("Router Address:", routerAddr);
  console.log("TokenA:", tokenAAddr);
  console.log("TokenB:", tokenBAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
