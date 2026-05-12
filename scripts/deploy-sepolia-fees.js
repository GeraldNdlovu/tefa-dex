import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Sepolia ETH balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  
  console.log("\n📦 Deploying to Sepolia with Fee Collector...\n");
  
  // ============ DEPLOY FEE COLLECTOR INFRASTRUCTURE ============
  console.log("1. Deploying Fee Infrastructure...");
  
  // Temporary addresses (will be updated later)
  const treasuryAddr = deployer.address; // Start with deployer as treasury
  const stakingAddr = deployer.address;  // Start with deployer as staking
  const fspAddr = deployer.address;      // Start with deployer as FSP
  
  const FeeCollector = await ethers.getContractFactory("FeeCollector");
  const feeCollector = await FeeCollector.deploy(treasuryAddr, stakingAddr, fspAddr);
  await feeCollector.waitForDeployment();
  const feeCollectorAddr = await feeCollector.getAddress();
  console.log(`   FeeCollector: ${feeCollectorAddr}`);
  
  // ============ DEPLOY TOKENS ============
  console.log("\n2. Deploying Tokens...");
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TEFA Token A", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TEFA Token B", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`   TokenA (TKA): ${tokenAAddr}`);
  console.log(`   TokenB (TKB): ${tokenBAddr}`);
  
  // ============ DEPLOY ROUTER ============
  console.log("\n3. Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy();
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   Router: ${routerAddr}`);
  
  // ============ CREATE POOL AND SET FEE COLLECTOR ============
  console.log("\n4. Creating Pool...");
  await router.createPool(tokenAAddr, tokenBAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`   Pool: ${poolAddr}`);
  
  // Set fee collector on pool
  const pool = await ethers.getContractAt("Pool", poolAddr);
  await pool.setFeeCollector(feeCollectorAddr);
  console.log(`   FeeCollector set on Pool`);
  
  // Grant POOL_ROLE to the pool address
  const POOL_ROLE = await feeCollector.POOL_ROLE();
  await feeCollector.grantRole(POOL_ROLE, poolAddr);
  console.log(`   POOL_ROLE granted to Pool`);
  
  // ============ ADD LIQUIDITY ============
  console.log("\n5. Adding Liquidity...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));
  await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  console.log("   ✅ Liquidity added: 10,000 TKA + 10,000 TKB");
  
  // ============ TEST SWAP ============
  console.log("\n6. Testing Swap...");
  const amountIn = ethers.parseEther("10");
  await tokenA.approve(routerAddr, amountIn);
  const swapTx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
  await swapTx.wait();
  console.log("   ✅ Test swap successful!");
  
  // ============ CHECK FEE COLLECTOR STATUS ============
  const split = await feeCollector.getSplit();
  console.log("\n7. Fee Split Configuration:");
  console.log(`   LP:       ${Number(split[0]) / 100}%`);
  console.log(`   Treasury: ${Number(split[1]) / 100}%`);
  console.log(`   Stakers:  ${Number(split[2]) / 100}%`);
  console.log(`   FSP:      ${Number(split[3]) / 100}%`);
  
  // ============ SUMMARY ============
  console.log("\n🎉 DEX DEPLOYED TO SEPOLIA WITH FEE COLLECTOR!");
  console.log("\n📋 Contract Addresses:");
  console.log(`   ROUTER:        ${routerAddr}`);
  console.log(`   POOL:          ${poolAddr}`);
  console.log(`   TOKEN_A (TKA): ${tokenAAddr}`);
  console.log(`   TOKEN_B (TKB): ${tokenBAddr}`);
  console.log(`   FEE_COLLECTOR: ${feeCollectorAddr}`);
  console.log(`   TREASURY:      ${treasuryAddr}`);
  console.log(`   STAKING:       ${stakingAddr}`);
  console.log(`   FSP:           ${fspAddr}`);
}

main().catch(console.error);
