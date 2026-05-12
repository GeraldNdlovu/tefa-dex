import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  const poolAddr = "0xCEE6A639C527D072135273bD3bA65C328a9cC0e6";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  
  // Check allowance for Router
  const routerAllowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance:", ethers.formatEther(routerAllowance));
  
  // Check allowance for Pool
  const poolAllowance = await tokenA.allowance(deployer.address, poolAddr);
  console.log("Pool allowance:", ethers.formatEther(poolAllowance));
  
  // Check allowance for the actual spender used in transferFrom
  console.log("\nApproving again with explicit spender...");
  const approve = await tokenA.approve(routerAddr, amount);
  await approve.wait();
  
  const newAllowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("New Router allowance:", ethers.formatEther(newAllowance));
  
  // Try transferFrom directly with the same addresses
  console.log("\nTrying transferFrom with pool as spender? No, that's wrong...");
  console.log("The spender should be the Router, but we're trying to transfer from deployer to pool");
  console.log("So the allowance should be for the Router");
  
  // Check if the Router address is correct
  const routerCode = await ethers.provider.getCode(routerAddr);
  console.log("Router has code:", routerCode !== "0x");
  
  const poolCode = await ethers.provider.getCode(poolAddr);
  console.log("Pool has code:", poolCode !== "0x");
}

main().catch(console.error);
