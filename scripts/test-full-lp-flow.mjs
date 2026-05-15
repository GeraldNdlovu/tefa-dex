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
    
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Starting nonce: ${nonce}`);
    
    // Get initial state
    let sharesBefore = await pool.lpShares(deployer.address);
    let totalSharesBefore = await pool.totalLpShares();
    let [reserve0Before, reserve1Before] = await pool.getReserves();
    
    console.log("\n📊 BEFORE ADDING LIQUIDITY:");
    console.log(`   Your LP Shares: ${ethers.formatEther(sharesBefore)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalSharesBefore)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0Before)} TKA, ${ethers.formatEther(reserve1Before)} TKB`);
    
    // Add 10 TKA and 10 TKB
    const amount = ethers.parseEther("10");
    console.log(`\n💧 Adding 10 TKA and 10 TKB...`);
    
    // Approve with manual nonce
    console.log("Approving TKA...");
    let tx = await tokenA.approve(ROUTER, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("40", "gwei"), gasLimit: 100000 });
    await tx.wait();
    console.log("TKA approved");
    
    console.log("Approving TKB...");
    tx = await tokenB.approve(ROUTER, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("40", "gwei"), gasLimit: 100000 });
    await tx.wait();
    console.log("TKB approved");
    
    console.log("Adding liquidity...");
    tx = await router.addLiquidity(TKA, TKB, amount, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("40", "gwei"), gasLimit: 500000 });
    await tx.wait();
    console.log("Liquidity added");
    
    // Get state after add
    let sharesAfter = await pool.lpShares(deployer.address);
    let totalSharesAfter = await pool.totalLpShares();
    let [reserve0After, reserve1After] = await pool.getReserves();
    
    console.log("\n📊 AFTER ADDING LIQUIDITY:");
    console.log(`   Your LP Shares: ${ethers.formatEther(sharesAfter)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalSharesAfter)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0After)} TKA, ${ethers.formatEther(reserve1After)} TKB`);
    
    const sharesAdded = Number(ethers.formatEther(sharesAfter)) - Number(ethers.formatEther(sharesBefore));
    console.log(`\n   ✅ You received ${sharesAdded.toFixed(6)} LP shares`);
    
    // Now test remove liquidity
    if (sharesAdded > 0) {
        console.log(`\n💧 Testing remove liquidity (removing ${sharesAdded.toFixed(6)} shares)...`);
        const sharesToRemove = ethers.parseEther(sharesAdded.toFixed(18));
        tx = await router.removeLiquidity(TKA, TKB, sharesToRemove, { nonce: nonce++, gasPrice: ethers.parseUnits("40", "gwei"), gasLimit: 500000 });
        await tx.wait();
        
        let sharesFinal = await pool.lpShares(deployer.address);
        let totalSharesFinal = await pool.totalLpShares();
        let [reserve0Final, reserve1Final] = await pool.getReserves();
        
        console.log("\n📊 AFTER REMOVING LIQUIDITY:");
        console.log(`   Your LP Shares: ${ethers.formatEther(sharesFinal)}`);
        console.log(`   Total LP Shares: ${ethers.formatEther(totalSharesFinal)}`);
        console.log(`   Reserves: ${ethers.formatEther(reserve0Final)} TKA, ${ethers.formatEther(reserve1Final)} TKB`);
        
        if (Math.abs(Number(ethers.formatEther(sharesFinal)) - Number(ethers.formatEther(sharesBefore))) < 0.001) {
            console.log("\n✅ Remove liquidity works perfectly!");
        } else {
            console.log(`\n⚠️ Shares mismatch. Expected: ${ethers.formatEther(sharesBefore)}, Got: ${ethers.formatEther(sharesFinal)}`);
        }
    }
}

main().catch(console.error);
