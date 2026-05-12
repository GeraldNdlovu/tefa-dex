import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    const [deployer] = await ethers.getSigners();
    
    const address = await deployer.getAddress();
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    // Get reserves using the public variables directly
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    
    const yourTKA = await tokenA.balanceOf(address);
    const yourTKB = await tokenB.balanceOf(address);
    
    // Your state BEFORE any swaps (from earlier)
    const initialTKA = ethers.parseEther("986476.0");
    const initialTKB = ethers.parseEther("991010.193165643780003662");
    
    const tkaSpent = Number(ethers.formatEther(initialTKA - yourTKA));
    const tkbGained = Number(ethers.formatEther(yourTKB - initialTKB));
    
    // Calculate your actual pool share
    const totalValueLocked = (Number(ethers.formatEther(reserve0)) * 1) + (Number(ethers.formatEther(reserve1)) * 0.6643);
    const yourValueLocked = (Number(ethers.formatEther(yourTKA)) * 1) + (Number(ethers.formatEther(yourTKB)) * 0.6643);
    const yourShare = (yourValueLocked / totalValueLocked) * 100;
    
    console.log("\n" + "=".repeat(55));
    console.log("💰 YOUR DEX PERFORMANCE SUMMARY");
    console.log("=".repeat(55));
    
    console.log("\n🔄 Your Swaps:");
    console.log(`   TKA Swapped out: ${tkaSpent.toFixed(2)}`);
    console.log(`   TKB Received: ${tkbGained.toFixed(4)}`);
    console.log(`   Average Rate: 1 TKA = ${(tkbGained / tkaSpent).toFixed(4)} TKB`);
    
    console.log("\n📊 Current Pool State:");
    console.log(`   TKA Reserve: ${ethers.formatEther(reserve0)}`);
    console.log(`   TKB Reserve: ${ethers.formatEther(reserve1)}`);
    console.log(`   Total Value Locked (TVL): $${totalValueLocked.toFixed(2)}`);
    console.log(`   Current Rate: 1 TKA = ${(Number(ethers.formatEther(reserve1)) / Number(ethers.formatEther(reserve0))).toFixed(4)} TKB`);
    
    console.log("\n💼 Your LP Position:");
    console.log(`   Your TKA: ${ethers.formatEther(yourTKA)}`);
    console.log(`   Your TKB: ${ethers.formatEther(yourTKB)}`);
    console.log(`   Your Value: $${yourValueLocked.toFixed(2)}`);
    console.log(`   Pool Share: ${yourShare.toFixed(2)}%`);
    
    // Fee estimation (0.3% fee, 60% to LPs)
    const swapVolume = tkaSpent * 0.6643; // in TKB equivalent
    const totalFees = swapVolume * 0.003;
    const lpFees = totalFees * 0.6;
    const yourFees = lpFees * (yourShare / 100);
    
    console.log("\n💰 Estimated Fee Earnings:");
    console.log(`   Total swap volume: $${swapVolume.toFixed(2)}`);
    console.log(`   Total fees collected: $${totalFees.toFixed(4)}`);
    console.log(`   Fees to LPs (60%): $${lpFees.toFixed(4)}`);
    console.log(`   YOUR FEES EARNED: $${yourFees.toFixed(4)}`);
    
    console.log("\n📈 Performance:");
    console.log(`   Your balance change: -${tkaSpent.toFixed(2)} TKA, +${tkbGained.toFixed(4)} TKB`);
    console.log(`   Value change: $${((tkbGained * 0.6643) - tkaSpent).toFixed(4)}`);
    
    console.log("\n" + "=".repeat(55));
    console.log("💡 Your DEX is LIVE and earning you passive income!");
    console.log("   Every swap adds to your fees. Keep the volume flowing!");
    console.log("=".repeat(55) + "\n");
}

main().catch(console.error);
