import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const poolAddr = "0xCEE6A639C527D072135273bD3bA65C328a9cC0e6";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance));
  
  console.log("\nTrying direct transfer to pool...");
  try {
    const tx = await tokenA.transfer(poolAddr, amount);
    await tx.wait();
    console.log("✅ Direct transfer succeeded!");
  } catch (error) {
    console.log("❌ Direct transfer failed:", error.message);
  }
  
  console.log("\nTrying transferFrom via Router...");
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance:", ethers.formatEther(allowance));
  
  if (allowance < amount) {
    console.log("Approving...");
    const approve = await tokenA.approve(routerAddr, amount);
    await approve.wait();
    console.log("Approved!");
  }
  
  try {
    const tx = await tokenA.transferFrom(deployer.address, poolAddr, amount);
    await tx.wait();
    console.log("✅ transferFrom succeeded!");
  } catch (error) {
    console.log("❌ transferFrom failed:", error.message);
  }
}

main().catch(console.error);
