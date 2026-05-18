import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  const POOL = "0x8170cc5bfc428F037eca2Ab77222a96D9344eF5c";
  
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const pool = await ethers.getContractAt("Pool", POOL);
  const router = await ethers.getContractAt("Router", ROUTER);
  
  // Check your LP shares using getLpInfo
  console.log("=== REMOVE LIQUIDITY ===\n");
  
  // Get reserves to calculate your share
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`Pool reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
  
  // Since you own 100%, you can withdraw all
  console.log("\nYou own 100% of the pool. Removing all liquidity...");
  
  // Note: Your Router needs a removeLiquidity function
  // If it doesn't exist, you'll need to call pool directly
  try {
    // Try router first
    const tx = await router.removeLiquidity(TKA, TKB, await pool.totalLpShares());
    await tx.wait();
    console.log("✅ Liquidity removed via Router");
  } catch(e) {
    console.log("Router.removeLiquidity not available, trying pool directly...");
    
    // Alternative: Call pool's removeLiquidity if it exists
    try {
      const totalShares = await pool.totalLpShares();
      const tx = await pool.removeLiquidity(totalShares);
      await tx.wait();
      console.log("✅ Liquidity removed via Pool");
    } catch(e2) {
      console.log("\n❌ Remove liquidity function not found in either Router or Pool.");
      console.log("Use the frontend UI instead - it handles the removal correctly.");
    }
  }
}

main().catch(console.error);
