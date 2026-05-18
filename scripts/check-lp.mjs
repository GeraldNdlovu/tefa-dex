import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  const POOL = "0x8170cc5bfc428F037eca2Ab77222a96D9344eF5c";  // New pool from your output
  
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const router = await ethers.getContractAt("Router", ROUTER);
  const pool = await ethers.getContractAt("Pool", POOL);
  const tokenA = await ethers.getContractAt("MockERC20", TKA);
  const tokenB = await ethers.getContractAt("MockERC20", TKB);
  
  console.log("=== LIQUIDITY STATUS ===\n");
  console.log(`Wallet: ${wallet}`);
  console.log(`New Pool: ${POOL}\n`);
  
  // Check if Router knows this pool
  const poolFromRouter = await router.getPool(TKA, TKB);
  console.log(`Pool registered in Router: ${poolFromRouter}`);
  console.log(`Matches new pool: ${poolFromRouter.toLowerCase() === POOL.toLowerCase() ? "✅ YES" : "❌ NO"}\n`);
  
  // Get pool reserves
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`Pool Reserves:`);
  console.log(`  TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`  TKB: ${ethers.formatEther(reserve1)}\n`);
  
  // Check LP info using getLpInfo (from your Pool ABI)
  try {
    const lpInfo = await pool.getLpInfo(wallet);
    console.log(`LP Info (getLpInfo):`);
    console.log(`  ${lpInfo}`);
  } catch(e) {
    console.log(`getLpInfo failed: ${e.message}`);
  }
  
  // Your token balances after adding liquidity
  const tkaBalance = await tokenA.balanceOf(wallet);
  const tkbBalance = await tokenB.balanceOf(wallet);
  console.log(`\nYour Token Balances After Adding Liquidity:`);
  console.log(`  TKA: ${ethers.formatEther(tkaBalance)}`);
  console.log(`  TKB: ${ethers.formatEther(tkbBalance)}`);
  
  // Calculate approximate share based on reserves
  const originalTKA = ethers.parseEther("975530.85920377328313182");
  const spentTKA = originalTKA - tkaBalance;
  const spentTKB = ethers.parseEther("982391.833488317220913983") - tkbBalance;
  console.log(`\nYou contributed:`);
  console.log(`  TKA: ${ethers.formatEther(spentTKA)}`);
  console.log(`  TKB: ${ethers.formatEther(spentTKB)}`);
  
  // Your share percentage
  const totalTKA = reserve0;
  const yourShare = totalTKA > 0 ? (spentTKA * 100n) / totalTKA : 0n;
  console.log(`\nYour estimated pool share: ~${yourShare}%`);
}

main().catch(console.error);
