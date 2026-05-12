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
    
    // Add 1000 TKA and 1000 TKB to the pool
    const amount = ethers.parseEther("1000");
    
    console.log("\n📊 Current balances:");
    console.log("   TKA:", ethers.formatEther(await tokenA.balanceOf(address)));
    console.log("   TKB:", ethers.formatEther(await tokenB.balanceOf(address)));
    
    // Get current pool reserves
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    const reserve0Before = await pool.reserve0();
    const reserve1Before = await pool.reserve1();
    
    console.log("\n📊 Current pool reserves:");
    console.log("   TKA:", ethers.formatEther(reserve0Before));
    console.log("   TKB:", ethers.formatEther(reserve1Before));
    
    console.log("\n💧 Adding liquidity...");
    console.log(`   Amount: ${ethers.formatEther(amount)} TKA and ${ethers.formatEther(amount)} TKB`);
    
    // Approve router to spend tokens
    console.log("   Approving TKA...");
    let tx = await tokenA.approve(ROUTER, amount);
    await tx.wait();
    
    console.log("   Approving TKB...");
    tx = await tokenB.approve(ROUTER, amount);
    await tx.wait();
    
    console.log("   Adding to pool...");
    tx = await router.addLiquidity(TKA, TKB, amount, amount);
    await tx.wait();
    
    console.log("\n✅ Liquidity added successfully!");
    
    // Get updated pool reserves
    const reserve0After = await pool.reserve0();
    const reserve1After = await pool.reserve1();
    
    console.log("\n📊 New pool reserves:");
    console.log("   TKA:", ethers.formatEther(reserve0After));
    console.log("   TKB:", ethers.formatEther(reserve1After));
    
    // Your updated balances
    console.log("\n📊 Your new balances:");
    console.log("   TKA:", ethers.formatEther(await tokenA.balanceOf(address)));
    console.log("   TKB:", ethers.formatEther(await tokenB.balanceOf(address)));
    
    console.log("\n📊 Liquidity added:");
    console.log("   TKA added:", ethers.formatEther(reserve0After - reserve0Before));
    console.log("   TKB added:", ethers.formatEther(reserve1After - reserve1Before));
}

main().catch(console.error);
