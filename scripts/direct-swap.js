import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // NEW ADDRESSES from latest deployment
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenBAddr = "0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89";
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer:", deployer.address);
  console.log("TKA balance before:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  
  const amountIn = ethers.parseEther("10");
  
  // Check allowance
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance:", ethers.formatEther(allowance));
  
  if (allowance < amountIn) {
    console.log("Approving...");
    const approve = await tokenA.approve(routerAddr, ethers.parseEther("100000"));
    await approve.wait();
    console.log("Approved!");
  }
  
  // Get pool address
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("Pool address:", poolAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  console.log("Pool TKA before:", ethers.formatEther(await tokenA.balanceOf(poolAddr)));
  
  console.log("\nExecuting swapDirect...");
  try {
    const tx = await router.swapDirect(tokenAAddr, tokenBAddr, amountIn);
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("❌ Swap failed:", error.message);
  }
  
  console.log("\nTKA balance after:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  console.log("Pool TKA after:", ethers.formatEther(await tokenA.balanceOf(poolAddr)));
}

main().catch(console.error);
