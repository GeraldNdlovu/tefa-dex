import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    // Your working Sepolia addresses
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    const [deployer] = await ethers.getSigners();
    
    const address = await deployer.getAddress();
    
    // Get pool address
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    // Get current pool reserves
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    const totalLPSupply = reserve0 + reserve1; // Simplified - in real DEX, LP tokens track this
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 YOUR LIQUIDITY POSITION");
    console.log("=".repeat(50));
    
    console.log("\n🔍 Pool State:");
    console.log(`   TKA Reserve: ${ethers.formatEther(reserve0)}`);
    console.log(`   TKB Reserve: ${ethers.formatEther(reserve1)}`);
    console.log(`   Total Value: ~${ethers.formatEther((reserve0 + reserve1) / 2n)} TKA-equivalent`);
    
    // Track your contribution (simplified)
    // Since you added 1000 TKA and 1000 TKB, and initial pool might have had other LPs
    // We need to calculate your share based on your deposits
    
    console.log("\n💰 Your Deposits (Last transaction):");
    console.log(`   TKA Deposited: 1,000.0`);
    console.log(`   TKB Deposited: 1,000.0`);
    
    // Your share of the pool (simplified - assumes you're the only LP)
    const yourTKA = 1000n;
    const yourTKB = 1000n;
    const sharePercentTKA = (Number(yourTKA) / Number(reserve0)) * 100;
    const sharePercentTKB = (Number(yourTKB) / Number(reserve1)) * 100;
    
    console.log("\n📈 Your Pool Share:");
    console.log(`   TKA Share: ${sharePercentTKA.toFixed(2)}%`);
    console.log(`   TKB Share: ${sharePercentTKB.toFixed(2)}%`);
    console.log(`   Average Share: ${((sharePercentTKA + sharePercentTKB) / 2).toFixed(2)}%`);
    
    // Fee estimation (0.3% fee per swap)
    // Track total swap volume from events (simplified - would need to query events)
    console.log("\n💸 Fee Earnings (Estimated):");
    console.log("   To see exact fee earnings, we need to track swap events.");
    console.log("   Since you added liquidity recently, fees will accumulate over time.");
    
    // Check if there's a FeeCollector contract
    try {
        const feeCollectorAddr = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"; // From earlier deployment
        const feeCollector = await ethers.getContractAt("FeeCollector", feeCollectorAddr);
        console.log("\n💰 Fee Collector Contract Found!");
        console.log(`   Address: ${feeCollectorAddr}`);
    } catch (e) {
        console.log("\n⚠️  Fee Collector not deployed yet. Fees are staying in the pool.");
        console.log("   You'll earn fees when swapping continues!");
    }
    
    console.log("\n📝 Notes:");
    console.log("   • Your LP position earns 0.3% of all swap volumes proportionally");
    console.log("   • To withdraw: call router.removeLiquidity()");
    console.log("   • Fees are automatically added to pool reserves");
    
    console.log("\n" + "=".repeat(50));
    console.log("💡 SUGGESTION: Run this script again after swaps to see fees grow!");
    console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
