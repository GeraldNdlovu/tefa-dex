import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
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
  console.log("\n📌 ADDRESSES:");
  console.log(`TokenA: ${tokenAAddr}`);
  console.log(`TokenB: ${tokenBAddr}`);
  
  // Deploy Router
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy();
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`Router: ${routerAddr}`);
  
  // Create Pool
  await router.createPool(tokenAAddr, tokenBAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`Pool: ${poolAddr}`);
  
  // Approve and add liquidity
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));
  await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  console.log("\n✅ Liquidity added: 10,000 TKA + 10,000 TKB");
  
  // Test swap
  const amountIn = ethers.parseEther("10");
  await tokenA.approve(routerAddr, amountIn);
  const swapTx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
  await swapTx.wait();
  console.log("✅ Test swap successful!");
  
  console.log("\n🎉 DEX READY! Update frontend with these addresses.");
}

main().catch(console.error);
