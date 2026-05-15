import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const ROUTER = "0xDa6Aa495AD5e74505571E07E6c909f5FF79d2f95";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    
    // Get pool
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    // Check current state
    let shares = await pool.lpShares(deployer.address);
    let totalShares = await pool.totalLpShares();
    let [reserve0, reserve1] = await pool.getReserves();
    
    console.log("\n📊 BEFORE ADDING LIQUIDITY:");
    console.log(`   Your LP Shares: ${ethers.formatEther(shares)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
    
    // Add 10 TKA and 10 TKB
    const amount = ethers.parseEther("10");
    console.log(`\n💧 Adding 10 TKA and 10 TKB...`);
    
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    
    // Approve
    let tx = await tokenA.approve(ROUTER, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    tx = await tokenB.approve(ROUTER, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    // Add liquidity
    tx = await router.addLiquidity(TKA, TKB, amount, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    // Check state after
    shares = await pool.lpShares(deployer.address);
    totalShares = await pool.totalLpShares();
    [reserve0, reserve1] = await pool.getReserves();
    
    console.log("\n📊 AFTER ADDING LIQUIDITY:");
    console.log(`   Your LP Shares: ${ethers.formatEther(shares)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
    
    if (Number(ethers.formatEther(shares)) > 0) {
        console.log("\n✅ LP shares are working! You now have LP tokens.");
        
        // Test removal
        console.log("\n💧 Testing remove liquidity...");
        const removeShares = shares;
        nonce = await ethers.provider.getTransactionCount(deployer.address);
        
        tx = await router.removeLiquidity(TKA, TKB, removeShares, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
        await tx.wait();
        
        shares = await pool.lpShares(deployer.address);
        totalShares = await pool.totalLpShares();
        [reserve0, reserve1] = await pool.getReserves();
        
        console.log("\n📊 AFTER REMOVING LIQUIDITY:");
        console.log(`   Your LP Shares: ${ethers.formatEther(shares)}`);
        console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
        console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
        console.log("\n✅ Remove liquidity works!");
    } else {
        console.log("\n❌ LP shares still 0. Need to debug share calculation.");
    }
}

main().catch(console.error);
