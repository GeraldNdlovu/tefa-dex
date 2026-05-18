import { network } from "hardhat";
async function main() {
  const { ethers } = await network.connect();
  const poolAddr = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
  const routerAddr = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  
  console.log("=== POOL FUNCTIONS ===");
  const poolFunctions = pool.interface.fragments.filter(f => f.type === 'function').map(f => f.name);
  console.log(poolFunctions.join("\n"));
  
  console.log("\n=== ROUTER FUNCTIONS ===");
  const routerFunctions = router.interface.fragments.filter(f => f.type === 'function').map(f => f.name);
  console.log(routerFunctions.join("\n"));
}
main();
