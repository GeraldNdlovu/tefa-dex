import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  // Get the actual token contract bytecode to verify it's ERC20
  const code = await ethers.provider.getCode(tokenAAddr);
  console.log("Token code length:", code.length);
  
  // Check token functions
  console.log("Token name:", await tokenA.name());
  console.log("Token symbol:", await tokenA.symbol());
  console.log("Token decimals:", await tokenA.decimals());
  
  // Check deployer balance
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance));
  
  // Check Router balance
  const routerBalance = await tokenA.balanceOf(routerAddr);
  console.log("Router balance:", ethers.formatEther(routerBalance));
  
  // Try a different transferFrom pattern
  const amount = ethers.parseEther("10");
  
  // Approve again
  console.log("\nApproving...");
  const approveTx = await tokenA.approve(routerAddr, amount);
  await approveTx.wait();
  
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance after approve:", ethers.formatEther(allowance));
  
  // Try transferFrom with explicit from address
  console.log("\nTrying transferFrom with explicit addresses...");
  try {
    const tx = await tokenA.transferFrom(deployer.address, routerAddr, amount);
    await tx.wait();
    console.log("✅ transferFrom from deployer to router succeeded!");
  } catch (error) {
    console.log("transferFrom to router failed:", error.message);
  }
  
  // Try transferFrom to pool
  const poolAddr = "0xCEE6A639C527D072135273bD3bA65C328a9cC0e6";
  try {
    const tx = await tokenA.transferFrom(deployer.address, poolAddr, amount);
    await tx.wait();
    console.log("✅ transferFrom from deployer to pool succeeded!");
  } catch (error) {
    console.log("transferFrom to pool failed:", error.message);
  }
}

main().catch(console.error);
