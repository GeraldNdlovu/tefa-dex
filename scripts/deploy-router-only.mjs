import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const FORWARDER = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const OLD_ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying new Router with removeLiquidity...\n");
  
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(FORWARDER);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`✅ New Router: ${routerAddr}`);
  
  // Create pool with existing tokens
  console.log("\nCreating pool with existing tokens...");
  const tx = await router.createPool(TKA, TKB);
  await tx.wait();
  const poolAddr = await router.getPool(TKA, TKB);
  console.log(`✅ Pool from new Router: ${poolAddr}`);
  
  console.log("\n⚠️  Note: This is a NEW pool, not your existing one.");
  console.log(`   Old pool (with your liquidity): 0x8170cc5bfc428F037eca2Ab77222a96D9344eF5c`);
  console.log(`   New pool: ${poolAddr}`);
  console.log("\n   To use your existing liquidity, you need to transfer LP shares or add liquidity again.");
  
  console.log("\n📌 Update your frontend with new Router address:");
  console.log(`   ROUTER: "${routerAddr}"`);
}

main().catch(console.error);
