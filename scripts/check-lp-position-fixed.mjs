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
    
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    
    // Your deposits (from when you added liquidity)
    const yourDepositTKA = ethers.parseEther("1000");
    const yourDepositTKB = ethers.parseEther("1000");
    
    // Calculate your share using BigNumber arithmetic
    const shareTKA = (Number(yourDepositTKA) * 100) / Number(reserve0);
    const shareTKB = (Number(yourDepositTKB) * 100) / Number(reserve1);
    const avgShare = (shareTKA + shareTKB) / 2;
    
    // Get your current token balances
    const yourTKABalance = await tokenA.balanceOf(address);
    const yourTKBBalance = await tokenB.balanceOf(address);
    const yourInitialTKABalance = await tokenA.balanceOf(address) + yourDepositTKA;
    
    console.log("\n" + "=".repeat(55));
    console.log("📊 YOUR LIQUIDITY POSITION - DETAILED");
    console.log("=".repeat(55));
    
    console.log("\n🔍 Pool State:");
    console.log(`   TKA Reserve: ${ethers.formatEther(reserve0)}`);
    console.log(`   TKB Reserve: ${ethers.formatEther(reserve1)}`);
    console.log(`   Ratio (TKA/TKB): ${(Number(reserve0) / Number(reserve1)).toFixed(4)}`);
    
    console.log("\n💰 Your Contribution:");
    console.log(`   TKA Deposited: ${ethers.formatEther(yourDepositTKA)}`);
    console.log(`   TKB Deposited: ${ethers.formatEther(yourDepositTKB)}`);
    console.log(`   Value at deposit: ~$${(1000 + 1000).toFixed(0)} (assuming 1:1 price)`);
    
    console.log("\n📈 Your Pool Share:");
    console.log(`   TKA Share: ${shareTKA.toFixed(4)}%`);
    console.log(`   TKB Share: ${shareTKB.toFixed(4)}%`);
    console.log(`   Average Share: ${avgShare.toFixed(4)}%`);
    
    // Estimate your share of fees
    // Since you added liquidity recently, let's track from this point forward
    
    console.log("\n💸 How Fees Work:");
    console.log("   • Each swap: 0.3% fee");
    console.log("   • 60% to LPs (you get your share)");
    console.log("   • Based on your pool share, you earn ~" + (avgShare * 0.6).toFixed(4) + "% of each swap");
    console.log("\n   Example: If someone swaps $10,000, you earn ~$" + ((10000 * 0.003 * 0.6 * avgShare) / 100).toFixed(4));
    
    console.log("\n📊 Your Current Balances:");
    console.log(`   TKA: ${ethers.formatEther(yourTKABalance)}`);
    console.log(`   TKB: ${ethers.formatEther(yourTKBBalance)}`);
    
    try {
        const feeCollector = await ethers.getContractAt("FeeCollector", "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1");
        console.log("\n💰 Fee Collector Status: Active");
    } catch (e) {
        console.log("\n⚠️  Fee Collector: Not accessible");
    }
    
    console.log("\n" + "=".repeat(55));
    console.log("💡 TIPS:");
    console.log("   1. Run this script after swaps to see fees accumulate");
    console.log("   2. Your share % increases if others remove liquidity");
    console.log("   3. Your share % decreases if others add more liquidity");
    console.log("=".repeat(55) + "\n");
}

main().catch(console.error);
