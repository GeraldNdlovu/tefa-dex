import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const ROUTER_ADDR = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  const POOL_ADDR = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
  const TKA_ADDR = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB_ADDR = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  
  const router = await ethers.getContractAt("Router", ROUTER_ADDR);
  
  console.log("=== REGISTERING POOL ===\n");
  console.log(`Router: ${ROUTER_ADDR}`);
  console.log(`Pool: ${POOL_ADDR}`);
  console.log(`TokenA: ${TKA_ADDR}`);
  console.log(`TokenB: ${TKB_ADDR}\n`);
  
  // Check current mapping
  const currentPool = await router.getPool(TKA_ADDR, TKB_ADDR);
  console.log(`Current pool in Router: ${currentPool === "0x0000000000000000000000000000000000000000" ? "❌ NOT REGISTERED" : currentPool}`);
  
  if (currentPool === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  Pool not registered. You need to call createPool again or manually set it.");
    console.log("\nOption 1: Create a new pool (will create a NEW pool, not use existing)");
    console.log("Option 2: The Router doesn't have a setPool function. You need to deploy a new Router+Pool pair.");
    console.log("\n📌 RECOMMENDATION: Deploy fresh Router and Pool together");
  }
  
  // Check if Pool has LP shares for your wallet
  const pool = await ethers.getContractAt("Pool", POOL_ADDR);
  const lpShares = await pool.lpShares("0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734");
  console.log(`\nYour LP shares in this pool: ${ethers.formatEther(lpShares)}`);
  
  if (lpShares === 0n) {
    console.log("\n❌ You have NO LP shares. You need to ADD LIQUIDITY first.");
    console.log("   The pool exists but you haven't provided liquidity.");
  } else {
    console.log("\n✅ You have LP shares! To remove liquidity, use:");
    console.log(`   router.removeLiquidity("${TKA_ADDR}", "${TKB_ADDR}", ${ethers.formatEther(lpShares)})`);
  }
}
main().catch(console.error);
