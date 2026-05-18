import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const TKA_ADDR = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB_ADDR = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER_ADDR = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  const POOL_ADDR = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
  
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const router = await ethers.getContractAt("Router", ROUTER_ADDR);
  const pool = await ethers.getContractAt("Pool", POOL_ADDR);
  const tokenA = await ethers.getContractAt("MockERC20", TKA_ADDR);
  const tokenB = await ethers.getContractAt("MockERC20", TKB_ADDR);
  
  console.log("=== LIQUIDITY DEBUG ===\n");
  console.log("Wallet:", wallet);
  
  // Token balances
  console.log(`\n📊 Token Balances:`);
  console.log(`   TKA: ${ethers.formatEther(await tokenA.balanceOf(wallet))}`);
  console.log(`   TKB: ${ethers.formatEther(await tokenB.balanceOf(wallet))}`);
  
  // Pool reserves
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n📊 Pool Reserves:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);
  
  // Check LP shares (liquidity provider tokens)
  try {
    const lpShares = await pool.lpShares(wallet);
    const totalLpShares = await pool.totalLpShares();
    const sharePercent = totalLpShares > 0 ? (lpShares * 100n) / totalLpShares : 0n;
    
    console.log(`\n📊 LP Shares:`);
    console.log(`   Your LP shares: ${ethers.formatEther(lpShares)}`);
    console.log(`   Total LP shares: ${ethers.formatEther(totalLpShares)}`);
    console.log(`   Your share: ${sharePercent}%`);
  } catch(e) {
    console.log(`\n⚠️  LP shares not available. Error: ${e.message}`);
    console.log(`   Your Pool contract may not have lpShares() function.`);
    console.log(`   Checking available functions...`);
    
    const methods = pool.interface.fragments.filter(f => f.type === 'function').map(f => f.name);
    console.log(`   Available: ${methods.join(", ")}`);
  }
  
  // Check allowances
  console.log(`\n📊 Allowances:`);
  console.log(`   Router allowance TKA: ${ethers.formatEther(await tokenA.allowance(wallet, ROUTER_ADDR))}`);
  console.log(`   Router allowance TKB: ${ethers.formatEther(await tokenB.allowance(wallet, ROUTER_ADDR))}`);
  
  // Check if pool is properly linked
  const poolFromRouter = await router.getPool(TKA_ADDR, TKB_ADDR);
  console.log(`\n📊 Pool address from Router: ${poolFromRouter}`);
  console.log(`   Matches actual pool: ${poolFromRouter.toLowerCase() === POOL_ADDR.toLowerCase() ? "✅ YES" : "❌ NO"}`);
}
main().catch(console.error);
