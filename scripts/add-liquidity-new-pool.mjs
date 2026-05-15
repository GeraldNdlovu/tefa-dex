import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const NEW_ROUTER = "0x2fe992eb78F4cbEA2cBE6378ED043101CDAb3b71";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    console.log("\n💧 Adding liquidity to new pool...");
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", NEW_ROUTER);
    
    const liquidityAmount = ethers.parseEther("1000");
    
    // Approve
    console.log("Approving TKA...");
    let tx = await tokenA.approve(NEW_ROUTER, liquidityAmount, { gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    console.log("Approving TKB...");
    tx = await tokenB.approve(NEW_ROUTER, liquidityAmount, { gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    // Add liquidity
    console.log("Adding liquidity...");
    tx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount, { gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    console.log("\n✅ Liquidity added successfully!");
    console.log("   Added 1,000 TKA + 1,000 TKB to new pool");
    
    // Check pool reserves
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    const [reserve0, reserve1] = await pool.getReserves();
    console.log(`\n📊 New pool reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
}

main().catch(console.error);
