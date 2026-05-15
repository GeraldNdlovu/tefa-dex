import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const ROUTER = "0xDa6Aa495AD5e74505571E07E6c909f5FF79d2f95";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    const router = await ethers.getContractAt("Router", ROUTER);
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    // Get current values
    const totalShares = await pool.totalLpShares();
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    
    console.log("\n📊 Current Pool State:");
    console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
    console.log(`   Reserve0 (TKA): ${ethers.formatEther(reserve0)}`);
    console.log(`   Reserve1 (TKB): ${ethers.formatEther(reserve1)}`);
    
    // Calculate expected shares for adding 10 TKA and 10 TKB
    const amount0 = ethers.parseEther("10");
    const amount1 = ethers.parseEther("10");
    
    const shares0 = (amount0 * totalShares) / reserve0;
    const shares1 = (amount1 * totalShares) / reserve1;
    
    console.log(`\n📊 Share Calculation for adding 10 TKA + 10 TKB:`);
    console.log(`   shares0 (based on TKA): ${ethers.formatEther(shares0)}`);
    console.log(`   shares1 (based on TKB): ${ethers.formatEther(shares1)}`);
    
    const shares = shares0 < shares1 ? shares0 : shares1;
    console.log(`   Min shares: ${ethers.formatEther(shares)}`);
    
    // Check if shares > 0
    if (shares > 0) {
        console.log(`\n✅ Shares should be minted: ${ethers.formatEther(shares)}`);
    } else {
        console.log(`\n❌ Shares calculation yields 0. Need to check integer division.`);
        console.log(`   raw shares0: ${shares0.toString()}`);
        console.log(`   raw shares1: ${shares1.toString()}`);
    }
    
    // The issue: When totalShares and reserves are both around 1e21 (1000 * 1e18),
    // and amount is 1e19 (10 * 1e18), the result is ~1e19 which when divided by 1e18 gives ~10
    // But our calculation shows 0 because we're using the wrong precision.
    
    // Let's check with scaled precision
    const PRECISION = ethers.parseEther("1"); // 1e18
    const scaledTotal = totalShares * PRECISION;
    const scaledShares0 = (amount0 * scaledTotal) / reserve0 / PRECISION;
    const scaledShares1 = (amount1 * scaledTotal) / reserve1 / PRECISION;
    
    console.log(`\n📊 Scaled Calculation (with 1e18 precision):`);
    console.log(`   scaled shares0: ${ethers.formatEther(scaledShares0)}`);
    console.log(`   scaled shares1: ${ethers.formatEther(scaledShares1)}`);
}

main().catch(console.error);
