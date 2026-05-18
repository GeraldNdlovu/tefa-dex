import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const TKA_ADDR = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB_ADDR = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER_ADDR = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const tokenA = await ethers.getContractAt("MockERC20", TKA_ADDR);
  const tokenB = await ethers.getContractAt("MockERC20", TKB_ADDR);
  const router = await ethers.getContractAt("Router", ROUTER_ADDR);
  
  console.log("=== ADD LIQUIDITY TO SEPOLIA ===\n");
  console.log(`Wallet: ${wallet}`);
  console.log(`TKA Balance: ${ethers.formatEther(await tokenA.balanceOf(wallet))}`);
  console.log(`TKB Balance: ${ethers.formatEther(await tokenB.balanceOf(wallet))}`);
  
  // First, approve the Router
  const amountA = ethers.parseEther("1000");
  const amountB = ethers.parseEther("1000");
  
  console.log(`\n📝 Approving Router to spend tokens...`);
  const approveA = await tokenA.approve(ROUTER_ADDR, amountA);
  const approveB = await tokenB.approve(ROUTER_ADDR, amountB);
  await approveA.wait();
  await approveB.wait();
  console.log(`✅ Approved TKA and TKB`);
  
  // Check if pool exists in Router mapping
  const poolAddr = await router.getPool(TKA_ADDR, TKB_ADDR);
  console.log(`\nPool from Router: ${poolAddr}`);
  
  if (poolAddr === "0x0000000000000000000000000000000000000000") {
    console.log(`\n⚠️  Pool not registered. Creating new pool...`);
    const tx = await router.createPool(TKA_ADDR, TKB_ADDR);
    await tx.wait();
    const newPoolAddr = await router.getPool(TKA_ADDR, TKB_ADDR);
    console.log(`✅ New Pool created: ${newPoolAddr}`);
  } else {
    console.log(`✅ Pool exists: ${poolAddr}`);
  }
  
  // Add liquidity
  console.log(`\n💧 Adding ${ethers.formatEther(amountA)} TKA and ${ethers.formatEther(amountB)} TKB...`);
  const addTx = await router.addLiquidity(TKA_ADDR, TKB_ADDR, amountA, amountB);
  await addTx.wait();
  console.log(`✅ Liquidity added successfully!`);
  
  // Get the pool contract to check LP shares
  const finalPoolAddr = await router.getPool(TKA_ADDR, TKB_ADDR);
  const pool = await ethers.getContractAt("Pool", finalPoolAddr);
  
  try {
    const lpShares = await pool.lpShares(wallet);
    console.log(`\n📊 Your LP Shares: ${ethers.formatEther(lpShares)}`);
    
    const totalLpShares = await pool.totalLpShares();
    const sharePercent = totalLpShares > 0 ? (lpShares * 100n) / totalLpShares : 0n;
    console.log(`   Total LP Shares: ${ethers.formatEther(totalLpShares)}`);
    console.log(`   Your Share: ${sharePercent}%`);
  } catch(e) {
    console.log(`\n⚠️  LP shares function not available. Check pool implementation.`);
  }
  
  // Show updated reserves
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n📊 Updated Pool Reserves:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);
}

main().catch(console.error);
