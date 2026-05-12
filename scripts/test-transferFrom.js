import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const poolAddr = "0xCEE6A639C527D072135273bD3bA65C328a9cC0e6";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  
  console.log("Deployer balance:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  console.log("Router allowance:", ethers.formatEther(await tokenA.allowance(deployer.address, routerAddr)));
  
  // Try transferFrom from deployer to pool using the Router's transferFrom (not via the Router contract)
  console.log("\nTrying token.transferFrom directly...");
  try {
    const tx = await tokenA.transferFrom(deployer.address, poolAddr, amount);
    await tx.wait();
    console.log("✅ Direct transferFrom succeeded!");
  } catch (error) {
    console.log("Direct transferFrom failed:", error.message);
  }
  
  // Now try the Router's swapDirect but we'll call the router's function step by step
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenABalanceBefore = await tokenA.balanceOf(poolAddr);
  console.log("\nPool TKA before:", ethers.formatEther(tokenABalanceBefore));
  
  console.log("Calling router.swapDirect...");
  try {
    const tx = await router.swapDirect(tokenAAddr, tokenAAddr, amount);
    await tx.wait();
    console.log("✅ Router swapDirect succeeded!");
  } catch (error) {
    console.log("Router swapDirect failed:", error.message);
  }
}

main().catch(console.error);
