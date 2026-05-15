import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const ROUTER = "0xDa6Aa495AD5e74505571E07E6c909f5FF79d2f95";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    const router = await ethers.getContractAt("Router", ROUTER);
    const poolAddr = await router.getPool(TKA, TKB);
    
    console.log("Pool address:", poolAddr);
    
    // Get the bytecode to verify the contract version
    const code = await ethers.provider.getCode(poolAddr);
    console.log("Code length:", code.length);
    
    // Try to call addLiquidity directly on pool to see if shares are minted
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    const amount = ethers.parseEther("1");
    console.log(`\nTesting direct pool.addLiquidity with 1 TKA and 1 TKB...`);
    
    // Approve pool directly
    await tokenA.approve(poolAddr, amount);
    await tokenB.approve(poolAddr, amount);
    
    const [deployer] = await ethers.getSigners();
    let sharesBefore = await pool.lpShares(deployer.address);
    console.log(`Shares before: ${ethers.formatEther(sharesBefore)}`);
    
    // Add liquidity directly to pool (not via router)
    const tx = await pool.addLiquidity(amount, amount);
    await tx.wait();
    
    let sharesAfter = await pool.lpShares(deployer.address);
    console.log(`Shares after: ${ethers.formatEther(sharesAfter)}`);
}

main().catch(console.error);
