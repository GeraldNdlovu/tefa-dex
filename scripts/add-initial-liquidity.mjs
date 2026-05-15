import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const ROUTER = "0xDa6Aa495AD5e74505571E07E6c909f5FF79d2f95";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    // Get current nonce
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Nonce: ${nonce}`);
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    
    const liquidityAmount = ethers.parseEther("1000");
    
    console.log(`\nAdding ${ethers.formatEther(liquidityAmount)} TKA and ${ethers.formatEther(liquidityAmount)} TKB...`);
    
    // Approve
    console.log("Approving TKA...");
    let tx = await tokenA.approve(ROUTER, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    console.log("Approving TKB...");
    tx = await tokenB.approve(ROUTER, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    // Add liquidity
    console.log("Adding liquidity...");
    tx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    console.log("\n✅ Initial liquidity added!");
    
    // Check pool state
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    const [reserve0, reserve1] = await pool.getReserves();
    console.log(`Pool reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
}

main().catch(console.error);
