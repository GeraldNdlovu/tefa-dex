import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const NEW_ROUTER = "0x2fe992eb78F4cbEA2cBE6378ED043101CDAb3b71";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    const POOL = "0xE8Ae9E53AA159769887E140d76B4Fcdce4B144F6";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", NEW_ROUTER);
    const pool = await ethers.getContractAt("Pool", POOL);
    
    // Check current LP shares
    let lpShares = await pool.lpShares(deployer.address);
    console.log(`Current LP shares: ${ethers.formatEther(lpShares)}`);
    
    const liquidityAmount = ethers.parseEther("10");
    
    console.log(`\nAdding ${ethers.formatEther(liquidityAmount)} TKA and ${ethers.formatEther(liquidityAmount)} TKB...`);
    
    // Approve
    await tokenA.approve(NEW_ROUTER, liquidityAmount);
    await tokenB.approve(NEW_ROUTER, liquidityAmount);
    
    // Add liquidity
    const tx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount);
    await tx.wait();
    
    // Check LP shares after
    lpShares = await pool.lpShares(deployer.address);
    console.log(`\nNew LP shares: ${ethers.formatEther(lpShares)}`);
    
    const totalLpShares = await pool.totalLpShares();
    console.log(`Total LP shares: ${ethers.formatEther(totalLpShares)}`);
    
    const [reserve0, reserve1] = await pool.getReserves();
    console.log(`Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
}

main().catch(console.error);
