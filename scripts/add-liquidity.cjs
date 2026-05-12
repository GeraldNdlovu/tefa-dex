const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    // Your working Sepolia addresses
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    
    const tokenA = await hre.ethers.getContractAt("MockERC20", TKA);
    const tokenB = await hre.ethers.getContractAt("MockERC20", TKB);
    const router = await hre.ethers.getContractAt("Router", ROUTER);
    
    // Amount to add (e.g., 1000 TKA and 1000 TKB)
    const amount = hre.ethers.parseEther("1000");
    
    console.log("\n📊 Current balances:");
    console.log("   TKA:", hre.ethers.formatEther(await tokenA.balanceOf(deployer.address)));
    console.log("   TKB:", hre.ethers.formatEther(await tokenB.balanceOf(deployer.address)));
    
    console.log("\n💧 Adding liquidity...");
    console.log(`   Amount: ${hre.ethers.formatEther(amount)} TKA and ${hre.ethers.formatEther(amount)} TKB`);
    
    // Approve router to spend tokens
    console.log("   Approving...");
    await tokenA.approve(ROUTER, amount);
    await tokenB.approve(ROUTER, amount);
    
    // Add liquidity
    const tx = await router.addLiquidity(TKA, TKB, amount, amount);
    await tx.wait();
    
    console.log("\n✅ Liquidity added successfully!");
    
    // Get pool reserves after
    const poolAddress = await router.getPool(TKA, TKB);
    const pool = await hre.ethers.getContractAt("Pool", poolAddress);
    const reserves = await pool.getReserves();
    
    console.log("\n📊 Pool reserves after:");
    console.log("   TKA:", hre.ethers.formatEther(reserves[0]));
    console.log("   TKB:", hre.ethers.formatEther(reserves[1]));
}

main().catch(console.error);
