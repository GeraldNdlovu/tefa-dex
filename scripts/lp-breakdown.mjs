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
    
    // Get reserves
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    
    // Get your balances
    const yourTKA = await tokenA.balanceOf(address);
    const yourTKB = await tokenB.balanceOf(address);
    
    // Your deposit into LP (1,000 TKA + 1,000 TKB)
    const lpDepositTKA = ethers.parseEther("1000");
    const lpDepositTKB = ethers.parseEther("1000");
    
    // Calculate your actual LP share
    const poolTKA = Number(ethers.formatEther(reserve0));
    const poolTKB = Number(ethers.formatEther(reserve1));
    const yourLPTKA = Number(ethers.formatEther(lpDepositTKA));
    const yourLPTKB = Number(ethers.formatEther(lpDepositTKB));
    
    const shareByTKA = (yourLPTKA / poolTKA) * 100;
    const shareByTKB = (yourLPTKB / poolTKB) * 100;
    const avgShare = (shareByTKA + shareByTKB) / 2;
    
    console.log("\n" + "=".repeat(60));
    console.log("🏊‍♂️ YOUR LIQUIDITY PROVIDER POSITION");
    console.log("=".repeat(60));
    
    console.log("\n📦 Your LP Deposit:");
    console.log(`   TKA: ${ethers.formatEther(lpDepositTKA)}`);
    console.log(`   TKB: ${ethers.formatEther(lpDepositTKB)}`);
    console.log(`   Value at deposit: ~$${((1000 + 1000) * 0.6643).toFixed(2)}`);
    
    console.log("\n💧 Current Pool:");
    console.log(`   TKA: ${poolTKA.toFixed(2)}`);
    console.log(`   TKB: ${poolTKB.toFixed(2)}`);
    console.log(`   TVL: $${(poolTKA + poolTKB * 0.6643).toFixed(2)}`);
    
    console.log("\n📊 Your Pool Share:");
    console.log(`   By TKA: ${shareByTKA.toFixed(2)}%`);
    console.log(`   By TKB: ${shareByTKB.toFixed(2)}%`);
    console.log(`   Average: ${avgShare.toFixed(2)}%`);
    
    // Calculate LP value
    const yourLPValue = (yourLPTKA + yourLPTKB * 0.6643);
    const yourShareOfTVL = (avgShare / 100) * (poolTKA + poolTKB * 0.6643);
    
    console.log("\n💰 Your LP Value:");
    console.log(`   Based on deposit: $${yourLPValue.toFixed(2)}`);
    console.log(`   Based on pool share: $${yourShareOfTVL.toFixed(2)}`);
    
    const earnedFees = yourShareOfTVL - yourLPValue;
    console.log(`   Earned from fees: $${earnedFees.toFixed(4)}`);
    
    console.log("\n🎯 Your Trading Balance (not in LP):");
    const tradingTKA = Number(ethers.formatEther(yourTKA)) - yourLPTKA;
    const tradingTKB = Number(ethers.formatEther(yourTKB)) - yourLPTKB;
    console.log(`   TKA: ${tradingTKA.toFixed(2)}`);
    console.log(`   TKB: ${tradingTKB.toFixed(2)}`);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ You're earning fees passively on your $2,000 LP position!");
    console.log(`   Current fees earned: ~$${earnedFees.toFixed(4)}`);
    console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
