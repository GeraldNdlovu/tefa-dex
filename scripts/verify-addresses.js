import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  // Get the latest block number
  const latestBlock = await ethers.provider.getBlockNumber();
  console.log("Latest block:", latestBlock);
  
  // Get approval events from last 100 blocks
  const filter = tokenA.filters.Approval(deployer.address);
  const events = await tokenA.queryFilter(filter, latestBlock - 100);
  
  console.log("Approval events found in last 100 blocks:", events.length);
  for (const event of events) {
    console.log("  Spender:", event.args.spender);
    console.log("  Value:", ethers.formatEther(event.args.value));
  }
  
  // Compare with what we think the router is
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  console.log("\nOur Router address:", routerAddr);
  
  // Check if router has code
  const routerCode = await ethers.provider.getCode(routerAddr);
  console.log("Router has code:", routerCode !== "0x");
  
  // Try to call a function on the router
  const router = await ethers.getContractAt("Router", routerAddr);
  try {
    const someValue = await router.feeCollector();
    console.log("Router feeCollector:", someValue);
  } catch (error) {
    console.log("Router call failed:", error.message);
  }
}

main().catch(console.error);
