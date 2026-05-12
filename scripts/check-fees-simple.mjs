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
    
    console.log("\n" + "=".repeat(55));
    console.log("💰 YOUR DEX ACTIVITY SUMMARY");
    console.log("=".repeat(55));
    
    console.log("\n🔄 Swaps Performed:");
    console.log(`   TKA Swapped out: ${tkaSpent.toFixed(2)}`);
    console.log(`   TKB Received: ${tkbGained.toFixed(4)}`);
    console.log(`   Average Rate: 1 TKA = ${(tkbGained / tkaSpent).toFixed(4)} TKB`);
    
    console.log("\n📊 Current Pool State:");
    console.log(`   TKA Reserve: ${ethers.formatEther(reserve0)}`);
    console.log(`   TKB Reserve: ${ethers.formatEther(reserve1)}`);
    console.log(`   Current Rate: 1 TKA = ${(Number(ethers.formatEther(reserve1)) / Number(ethers.formatEther(reserve0))).toFixed(4)} TKB`);
    
    console.log("\n💼 Your LP Position:");
    const yourTKAShare = (Number(ethers.formatEther(yourTKA)) / Number(ethers.formatEther(reserve0))) * 100;
    const yourTKBShare = (Number(ethers.formatEther(yourTKB)) / Number(ethers.formatEther(reserve1))) * 100;
    console.log(`   Pool Share: ~${((yourTKAShare + yourTKBShare) / 2).toFixed(2)}%`);
    console.log(`   Estimated Fees Earned: ~$${(tkbGained * 0.003 * 0.6).toFixed(4)}`);
    
    console.log("\n" + "=".repeat(55));
    console.log("💡 Your DEX is earning fees with every swap!");
    console.log("=".repeat(55) + "\n");
}

main().catch(console.error);
