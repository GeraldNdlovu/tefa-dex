import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  console.log("Deploying SimpleRouter and SimplePool...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy tokens
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log("TokenA:", tokenAAddr);
  console.log("TokenB:", tokenBAddr);
  
  // Deploy SimpleRouter
  const SimpleRouter = await ethers.getContractFactory("SimpleRouter");
  const router = await SimpleRouter.deploy();
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("SimpleRouter:", routerAddr);
  
  // Create pool
  const createTx = await router.createPool(tokenAAddr, tokenBAddr);
  await createTx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("Pool:", poolAddr);
  
  console.log("\nApproving Router...");
  const approveA = await tokenA.approve(routerAddr, ethers.parseEther("100000"));
  await approveA.wait();
  const approveB = await tokenB.approve(routerAddr, ethers.parseEther("100000"));
  await approveB.wait();
  console.log("Approved!");
  
  console.log("\nAdding liquidity...");
  const addLiq = await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  await addLiq.wait();
  console.log("Liquidity added");
  
  console.log("\nTesting swap...");
  const amountIn = ethers.parseEther("10");
  const swapTx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
  await swapTx.wait();
  console.log("✅ Swap successful!");
  
  console.log("\nDeployment and test complete!");
}

main().catch(console.error);
