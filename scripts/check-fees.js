import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // Get the current pool address from the router
  const routerAddr = "0x59b670e9fA9D0A427751Af201D676719a970857b";
  const tokenAAddr = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
  const tokenBAddr = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  
  const treasuryAddr = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
  const fspAddr = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  const feeCollectorAddr = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const feeCollector = await ethers.getContractAt("FeeCollector", feeCollectorAddr);
  
  console.log("\n📊 TEFA DEX - FINANCIAL STATUS\n");
  console.log("═".repeat(50));
  console.log(`\n📍 Pool Address: ${poolAddr}`);
  
  // Get ETH balances
  const treasuryBal = await ethers.provider.getBalance(treasuryAddr);
  const fspBal = await ethers.provider.getBalance(fspAddr);
  
  console.log("\n💰 ETH BALANCES:");
  console.log(`   Treasury:     ${ethers.formatEther(treasuryBal)} ETH`);
  console.log(`   FSP:          ${ethers.formatEther(fspBal)} ETH`);
  
  // Pool reserves
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log(`\n💧 POOL RESERVES:`);
  console.log(`   TKA: ${ethers.formatEther(reserve0)}`);
  console.log(`   TKB: ${ethers.formatEther(reserve1)}`);
  
  // Pool token balances
  const poolTKA = await tokenA.balanceOf(poolAddr);
  console.log(`\n💰 POOL TOKEN BALANCES:`);
  console.log(`   Pool TKA: ${ethers.formatEther(poolTKA)}`);
  
  // Fee split
  const split = await feeCollector.getSplit();
  console.log(`\n🔀 FEE SPLIT:`);
  console.log(`   LP:       ${Number(split[0]) / 100}%`);
  console.log(`   Treasury: ${Number(split[1]) / 100}%`);
  console.log(`   Stakers:  ${Number(split[2]) / 100}%`);
  console.log(`   FSP:      ${Number(split[3]) / 100}%`);
  
  console.log("\n" + "═".repeat(50));
}

main().catch(console.error);
