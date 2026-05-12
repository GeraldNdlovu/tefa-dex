import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0xC1e0A9DB9eA830c52603798481045688c8AE99C2";
  const routerAddr = "0x1c9fD50dF7a4f066884b58A05D91e4b55005876A";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  // Get all approvals
  const filter = tokenA.filters.Approval(deployer.address);
  const events = await tokenA.queryFilter(filter, -50);
  
  console.log("Approvals for deployer:");
  for (const event of events) {
    console.log(`  Spender: ${event.args.spender}, Amount: ${ethers.formatEther(event.args.value)}`);
  }
  
  // Check current allowance for our router
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log(`\nCurrent allowance for router ${routerAddr}: ${ethers.formatEther(allowance)}`);
  
  // Check if router has code
  const code = await ethers.provider.getCode(routerAddr);
  console.log(`Router has code: ${code !== "0x"}`);
}

main().catch(console.error);
