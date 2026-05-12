import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Get current nonce
  let nonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Starting nonce:", nonce);
  
  // Deploy FeeCollector
  console.log("\n1. Deploying FeeCollector...");
  const treasuryAddr = deployer.address;
  const stakingAddr = deployer.address;
  const fspAddr = deployer.address;
  
  const FeeCollector = await ethers.getContractFactory("FeeCollector");
  const feeCollector = await FeeCollector.deploy(treasuryAddr, stakingAddr, fspAddr, { nonce: nonce++ });
  await feeCollector.waitForDeployment();
  const feeCollectorAddr = await feeCollector.getAddress();
  console.log(`   FeeCollector: ${feeCollectorAddr}`);
  
  // Deploy tokens
  console.log("\n2. Deploying Tokens...");
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TEFA Token A", "TKA", ethers.parseEther("1000000"), { nonce: nonce++ });
  const tokenB = await Token.deploy("TEFA Token B", "TKB", ethers.parseEther("1000000"), { nonce: nonce++ });
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`   TokenA: ${tokenAAddr}`);
  console.log(`   TokenB: ${tokenBAddr}`);
  
  // Deploy Router
  console.log("\n3. Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy({ nonce: nonce++ });
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   Router: ${routerAddr}`);
  
  // Create Pool
  console.log("\n4. Creating Pool...");
  const createTx = await router.createPool(tokenAAddr, tokenBAddr, { nonce: nonce++ });
  await createTx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`   Pool: ${poolAddr}`);
  
  console.log("\n🎉 Success! Save these addresses:");
  console.log(`ROUTER: ${routerAddr}`);
  console.log(`TOKEN_A: ${tokenAAddr}`);
  console.log(`TOKEN_B: ${tokenBAddr}`);
  console.log(`POOL: ${poolAddr}`);
  console.log(`FEE_COLLECTOR: ${feeCollectorAddr}`);
}

main().catch(console.error);
