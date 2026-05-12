import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenBAddr = "0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  
  // Get the pool address
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("Pool address:", poolAddr);
  
  // Check allowance for Router
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance:", ethers.formatEther(allowance));
  
  // Approve again to be sure
  console.log("\nRe-approving 10,000 TKA...");
  const approveTx = await tokenA.approve(routerAddr, ethers.parseEther("10000"));
  await approveTx.wait();
  
  const newAllowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("New allowance:", ethers.formatEther(newAllowance));
  
  // Check balance
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("Deployer TKA balance:", ethers.formatEther(balance));
  
  // Try the swap with explicit gas limit
  console.log("\nExecuting swap with gas limit...");
  try {
    const tx = await router.swap(tokenAAddr, tokenBAddr, amount, {
      gasLimit: 500000
    });
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("Swap failed:", error.message);
    
    // Try to see what the Router's swap function does
    console.log("\nTrying to simulate the transfer...");
    try {
      const tx2 = await router.callStatic.swap(tokenAAddr, tokenBAddr, amount);
      console.log("Static call succeeded, would return:", tx2);
    } catch (staticError) {
      console.log("Static call failed:", staticError.message);
    }
  }
}

main().catch(console.error);
