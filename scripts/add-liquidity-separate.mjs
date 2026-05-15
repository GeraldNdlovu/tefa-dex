import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const ROUTER = "0xDa6Aa495AD5e74505571E07E6c909f5FF79d2f95";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    const POOL = "0x553732A2730291e044dF7f25F5126B61f057b041";
    
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Nonce: ${nonce}`);
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    const pool = await ethers.getContractAt("Pool", POOL);
    
    const liquidityAmount = ethers.parseEther("1000");
    
    console.log(`\nAdding ${ethers.formatEther(liquidityAmount)} TKA and ${ethers.formatEther(liquidityAmount)} TKB...`);
    
    // Approve
    console.log("Approving TKA...");
    let tx = await tokenA.approve(ROUTER, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("50", "gwei"), gasLimit: 200000 });
    await tx.wait();
    
    console.log("Approving TKB...");
    tx = await tokenB.approve(ROUTER, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("50", "gwei"), gasLimit: 200000 });
    await tx.wait();
    
    // Add liquidity
    console.log("Adding liquidity...");
    tx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount, { nonce: nonce++, gasPrice: ethers.parseUnits("50", "gwei"), gasLimit: 500000 });
    await tx.wait();
    
    console.log("\n✅ Initial liquidity added!");
    
    // Verify
    const shares = await pool.lpShares(deployer.address);
    const totalShares = await pool.totalLpShares();
    const [reserve0, reserve1] = await pool.getReserves();
    console.log(`\n📊 Pool State:`);
    console.log(`   Your LP Shares: ${ethers.formatEther(shares)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
}

main().catch(console.error);
