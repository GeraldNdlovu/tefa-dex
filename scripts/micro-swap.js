import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenBAddr = "0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  // Try a very small amount
  const amount = ethers.parseUnits("0.000001", 18);
  
  console.log("Amount:", ethers.formatEther(amount));
  console.log("Deployer balance:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  
  // Approve a small amount
  const approveTx = await tokenA.approve(routerAddr, amount);
  await approveTx.wait();
  
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance:", ethers.formatEther(allowance));
  
  // Check if the swap function exists
  console.log("\nRouter functions:", Object.keys(router.functions || {}));
  
  // Try the swap
  try {
    const tx = await router.swap(tokenAAddr, tokenBAddr, amount);
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("Swap failed:", error.message);
    
    // Try to get the revert reason from the contract
    try {
      const result = await router.callStatic.swap(tokenAAddr, tokenBAddr, amount);
      console.log("Static call result:", result);
    } catch (staticError) {
      console.log("Static call error:", staticError.message);
    }
  }
}

main().catch(console.error);
