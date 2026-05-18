import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const { ethers: hardhatEthers } = hre;
  
  console.log("\n========================================");
  console.log("🚀 TEFA DEX - LOCAL DEPLOYMENT");
  console.log("========================================\n");

  const [deployer] = await hardhatEthers.getSigners();
  console.log(`📡 Deployer: ${deployer.address}`);
  const balance = await hardhatEthers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy TrustedForwarder
  const Forwarder = await hardhatEthers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`✅ TrustedForwarder: ${forwarderAddr}`);

  // Deploy Tokens
  const Token = await hardhatEthers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`✅ TokenA (TKA): ${tokenAAddr}`);
  console.log(`✅ TokenB (TKB): ${tokenBAddr}`);

  // Deploy Router
  const Router = await hardhatEthers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`✅ Router: ${routerAddr}`);

  // Create Pool
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`✅ Pool: ${poolAddr}`);

  // Approve and add liquidity
  console.log("\n💰 Approving tokens...");
  const amount = ethers.parseEther("10000");
  await tokenA.approve(routerAddr, amount);
  await tokenB.approve(routerAddr, amount);

  console.log("💧 Adding initial liquidity...");
  await router.addLiquidity(tokenAAddr, tokenBAddr, amount, amount);

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
