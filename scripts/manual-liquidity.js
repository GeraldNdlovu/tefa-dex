import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // NEW ADDRESSES from this deployment
  const routerAddr = "0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE";
  const tokenAAddr = "0x5302E909d1e93e30F05B5D6Eea766363D14F9892";
  const tokenBAddr = "0x0ed64d01D0B4B655E410EF1441dD677B695639E7";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("Initial TKA:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  console.log("Initial TKB:", ethers.formatEther(await tokenB.balanceOf(deployer.address)));
  
  console.log("\n1. Approving Router...");
  await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await tokenB.approve(routerAddr, ethers.parseEther("10000"));
  
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance after approval:", ethers.formatEther(allowance));
  
  console.log("\n2. Adding liquidity...");
  const tx = await router.addLiquidity(tokenAAddr, tokenBAddr, ethers.parseEther("10000"), ethers.parseEther("10000"));
  await tx.wait();
  console.log("Transaction completed!");
  
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("Pool address:", poolAddr);
  
  console.log("\n✅ Done!");
}

main().catch(console.error);
