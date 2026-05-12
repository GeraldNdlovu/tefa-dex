import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenBAddr = "0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89";
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  
  // Check allowance
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance:", ethers.formatEther(allowance));
  
  if (allowance < amount) {
    console.log("Approving...");
    const approve = await tokenA.approve(routerAddr, ethers.parseEther("10000"));
    await approve.wait();
    console.log("Approved!");
  }
  
  // Call the swap function directly (not swapDirect)
  console.log("Calling router.swap...");
  try {
    const tx = await router.swap(tokenAAddr, tokenBAddr, amount);
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("Swap failed:", error.message);
  }
  
  // Check if pool received tokens
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  console.log("Pool TKA balance:", ethers.formatEther(await tokenA.balanceOf(poolAddr)));
}

main().catch(console.error);
