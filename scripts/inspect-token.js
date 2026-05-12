import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  // Get the actual spender address from the token's perspective
  console.log("Deployer address:", deployer.address);
  console.log("Router address:", routerAddr);
  
  // Check allowance multiple times
  for (let i = 0; i < 3; i++) {
    const allowance = await tokenA.allowance(deployer.address, routerAddr);
    console.log(`Allowance check ${i+1}:`, ethers.formatEther(allowance));
  }
  
  // Approve a new amount
  const amount = ethers.parseEther("1000");
  console.log(`\nApproving ${ethers.formatEther(amount)}...`);
  const approveTx = await tokenA.approve(routerAddr, amount);
  await approveTx.wait();
  
  const newAllowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("New allowance:", ethers.formatEther(newAllowance));
  
  // Try transferFrom with the correct spender
  const poolAddr = "0xCEE6A639C527D072135273bD3bA65C328a9cC0e6";
  console.log("\nTrying transferFrom from deployer to pool...");
  try {
    const tx = await tokenA.transferFrom(deployer.address, poolAddr, ethers.parseEther("10"));
    await tx.wait();
    console.log("✅ transferFrom succeeded!");
  } catch (error) {
    console.log("transferFrom failed:", error.message);
    console.log("Error data:", error.data);
  }
}

main().catch(console.error);
