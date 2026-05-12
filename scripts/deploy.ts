import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ethers } = await network.connect();
  console.log("========================================");
  console.log("🚀 TEFA DEX - FULL DEPLOYMENT");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // ========== PHASE 1: Fee Infrastructure ==========
  console.log("📦 PHASE 1: Deploying Fee Infrastructure...");

  const FeeSubsidyPool = await ethers.getContractFactory("FeeSubsidyPool");
  const feeSubsidyPool = await FeeSubsidyPool.deploy();
  await feeSubsidyPool.waitForDeployment();
  const fspAddr = await feeSubsidyPool.getAddress();
  console.log(`   ✅ FeeSubsidyPool: ${fspAddr}`);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(fspAddr);
  await treasury.waitForDeployment();
  const treasuryAddr = await treasury.getAddress();
  console.log(`   ✅ Treasury: ${treasuryAddr}`);

  const FeeCollector = await ethers.getContractFactory("FeeCollector");
  const feeCollector = await FeeCollector.deploy(treasuryAddr, deployer.address, fspAddr);
  await feeCollector.waitForDeployment();
  const feeCollectorAddr = await feeCollector.getAddress();
  console.log(`   ✅ FeeCollector: ${feeCollectorAddr}`);

  // ========== PHASE 2: Forwarder (EIP-2771) ==========
  console.log("\n📦 PHASE 2: Deploying Forwarder...");

  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`   ✅ TrustedForwarder: ${forwarderAddr}`);

  // ========== PHASE 3: Tokens ==========
  console.log("\n📦 PHASE 3: Deploying Tokens...");

  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`   ✅ TokenA (TKA): ${tokenAAddr}`);
  console.log(`   ✅ TokenB (TKB): ${tokenBAddr}`);

  // ========== PHASE 4: Router ==========
  console.log("\n📦 PHASE 4: Deploying Router...");

  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   ✅ Router: ${routerAddr}`);
  
  // Set FeeCollector on Router
  await router.setFeeCollector(feeCollectorAddr);
  console.log(`   ✅ FeeCollector set on Router`);

  // ========== PHASE 5: Pool ==========
  console.log("\n📦 PHASE 5: Creating Pool...");

  await router.createPool(tokenAAddr, tokenBAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`   ✅ Pool: ${poolAddr}`);

  // ========== PHASE 6: Grant Roles ==========
  console.log("\n🔧 PHASE 6: Granting Roles...");

  const POOL_ROLE = await feeCollector.POOL_ROLE();
  await feeCollector.grantRole(POOL_ROLE, poolAddr);
  console.log(`   ✅ Granted POOL_ROLE to Pool`);

  const RELAYER_ROLE = await feeSubsidyPool.RELAYER_ROLE();
  await feeSubsidyPool.grantRole(RELAYER_ROLE, deployer.address);
  console.log(`   ✅ Granted RELAYER_ROLE to deployer`);

  // ========== PHASE 7: Approve Router ==========
  console.log("\n💰 PHASE 7: Approving Router...");

  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));
  console.log(`   ✅ Router approved`);

  // ========== PHASE 8: Add Liquidity ==========
  console.log("\n💧 PHASE 8: Adding Liquidity...");

  await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  console.log(`   ✅ Liquidity added`);

  // ========== PHASE 9: Seed FSP ==========
  console.log("\n💸 PHASE 9: Seeding FeeSubsidyPool...");

  await deployer.sendTransaction({
    to: fspAddr,
    value: ethers.parseEther("10")
  });
  console.log(`   ✅ FSP seeded with 10 ETH`);

  // ========== PHASE 10: Check Reserves ==========
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n📊 Pool Reserves:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);

  // ========== PHASE 11: Frontend Config ==========
  const configPath = path.join(__dirname, "../frontend/src/config/contracts.ts");
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
  POOL: "${poolAddr}",
  TREASURY: "${treasuryAddr}",
  FEE_COLLECTOR: "${feeCollectorAddr}",
  FEE_SUBSIDY_POOL: "${fspAddr}"
};`;

  fs.writeFileSync(configPath, configContent);
  console.log("\n✅ Frontend config automatically updated!");

  // ========== SUMMARY ==========
  console.log("\n========================================");
  console.log("🎉 TEFA DEX - DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log(`\n📌 Contract Addresses:`);
  console.log(`   Router:           ${routerAddr}`);
  console.log(`   Pool:             ${poolAddr}`);
  console.log(`   TokenA (TKA):     ${tokenAAddr}`);
  console.log(`   TokenB (TKB):     ${tokenBAddr}`);
  console.log(`   Forwarder:        ${forwarderAddr}`);
  console.log(`   Treasury:         ${treasuryAddr}`);
  console.log(`   FeeCollector:     ${feeCollectorAddr}`);
  console.log(`   FeeSubsidyPool:   ${fspAddr}`);
  
  const split = await feeCollector.getSplit();
  console.log(`\n📊 Fee Split:`);
  console.log(`   LP:       ${Number(split[0]) / 100}%`);
  console.log(`   Treasury: ${Number(split[1]) / 100}%`);
  console.log(`   Stakers:  ${Number(split[2]) / 100}%`);
  console.log(`   FSP:      ${Number(split[3]) / 100}%`);
  
  const fspBalance = await deployer.provider.getBalance(fspAddr);
  console.log(`\n💾 FSP Balance: ${ethers.formatEther(fspBalance)} ETH`);
  console.log("\n========================================\n");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed!");
  console.error(error);
  process.exitCode = 1;
});
