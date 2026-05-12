import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // NEW ADDRESSES from this deployment
  const routerAddr = "0xe039608E695D21aB11675EBBA00261A0e750526c";
  const tokenAAddr = "0x56D13Eb21a625EdA8438F55DF2C31dC3632034f5";
  const tokenBAddr = "0xE8addD62feD354203d079926a8e563BC1A7FE81e"
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const balanceBefore = await tokenA.balanceOf(deployer.address);
  console.log("TKA Balance before:", ethers.formatEther(balanceBefore));
  
  const amountIn = ethers.parseEther("10");
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Current allowance:", ethers.formatEther(allowance));
  
  if (allowance < amountIn) {
    console.log("\nApproving Router...");
    const approveTx = await tokenA.approve(routerAddr, amountIn);
    await approveTx.wait();
    console.log("Approved!");
  }
  
  console.log("\nSwapping 10 TKA for TKB...");
  const swapTx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
  await swapTx.wait();
  console.log("✅ Swap successful!");
  
  const balanceAfter = await tokenA.balanceOf(deployer.address);
  console.log("TKA Balance after:", ethers.formatEther(balanceAfter));
}

main().catch(console.error);
