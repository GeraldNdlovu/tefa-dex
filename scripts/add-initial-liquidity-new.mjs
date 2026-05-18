import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const NEW_ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Nonce: ${nonce}`);
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", NEW_ROUTER);
    
    const liquidityAmount = ethers.parseEther("1000");
    
    console.log(`\nAdding ${ethers.formatEther(liquidityAmount)} TKA and ${ethers.formatEther(liquidityAmount)} TKB...`);
    
    // Approve with higher gas
    console.log("Approving TKA...");
    let tx = await tokenA.approve(NEW_ROUTER, liquidityAmount, { 
        nonce: nonce++, 
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 200000
    });
    await tx.wait();
    
    console.log("Approving TKB...");
    tx = await tokenB.approve(NEW_ROUTER, liquidityAmount, { 
        nonce: nonce++, 
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 200000
    });
    await tx.wait();
    
    console.log("Adding liquidity...");
    tx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount, { 
        nonce: nonce++, 
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 500000
    });
    await tx.wait();
    
    console.log("\n✅ Initial liquidity added!");
    
    // Check pool state
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    const shares = await pool.lpShares(deployer.address);
    const totalShares = await pool.totalLpShares();
    const [reserve0, reserve1] = await pool.getReserves();
    
    console.log(`\n📊 Pool State:`);
    console.log(`   Your LP Shares: ${ethers.formatEther(shares)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalShares)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
}

main().catch(console.error);
