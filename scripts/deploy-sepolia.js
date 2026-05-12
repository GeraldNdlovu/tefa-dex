import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Sepolia ETH balance:", ethers.formatEther(balance));
  
  if (balance === 0n) {
    console.log("❌ No Sepolia ETH! Get testnet ETH first.");
    return;
  }
  
  console.log("\n📦 Deploying to Sepolia...\n");
  
  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log("Current gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  const deployOptions = {
    gasPrice: gasPrice * 2n, // Double the gas price for faster confirmation
    gasLimit: 5000000,
  };
  
  // Deploy tokens
  console.log("Deploying TokenA...");
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TEFA Token A", "TKA", ethers.parseEther("1000000"), deployOptions);
  await tokenA.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  console.log(`TokenA (TKA): ${tokenAAddr}`);
  
  console.log("Deploying TokenB...");
  const tokenB = await Token.deploy("TEFA Token B", "TKB", ethers.parseEther("1000000"), deployOptions);
  await tokenB.waitForDeployment();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`TokenB (TKB): ${tokenBAddr}`);
  
  // Deploy Router
  console.log("Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(deployOptions);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`Router: ${routerAddr}`);
  
  // Create Pool
  console.log("Creating Pool...");
  const createTx = await router.createPool(tokenAAddr, tokenBAddr, deployOptions);
  await createTx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`Pool: ${poolAddr}`);
  
  // Approve and add liquidity
  console.log("Approving Router...");
  const approveA = await tokenA.approve(routerAddr, ethers.parseEther("10000"), deployOptions);
  await approveA.wait();
  const approveB = await tokenB.approve(routerAddr, ethers.parseEther("10000"), deployOptions);
  await approveB.wait();
  
  console.log("Adding liquidity...");
  const addLiqTx = await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"), deployOptions);
  await addLiqTx.wait();
  console.log("✅ Liquidity added: 10,000 TKA + 10,000 TKB");
  
  // Test swap
  console.log("Testing swap...");
  const approveSwap = await tokenA.approve(routerAddr, ethers.parseEther("10"), deployOptions);
  await approveSwap.wait();
  const swapTx = await router.swap(tokenAAddr, tokenBAddr, ethers.parseEther("10"), deployOptions);
  await swapTx.wait();
  console.log("✅ Test swap successful!");
  
  console.log("\n🎉 DEX DEPLOYED TO SEPOLIA!");
  console.log("\n📋 Save these addresses for frontend:");
  console.log(`ROUTER: ${routerAddr}`);
  console.log(`TOKEN_A: ${tokenAAddr}`);
  console.log(`TOKEN_B: ${tokenBAddr}`);
  console.log(`POOL: ${poolAddr}`);
}

main().catch(console.error);

