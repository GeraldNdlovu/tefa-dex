import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    const OLD_POOL = "0x7f0D613811aA4de7FE0981A41267f9838Da804D1";
    const ROUTER = "0x1C12AD5634CeBE3073A73E1d79888813D4FAD301";
    
    console.log("\n🚀 Deploying new Pool with LP tracking...");
    
    // Deploy new Pool
    const Pool = await ethers.getContractFactory("Pool");
    const pool = await Pool.deploy(TKA, TKB);
    await pool.waitForDeployment();
    const poolAddr = await pool.getAddress();
    console.log(`   ✅ New Pool deployed: ${poolAddr}`);
    
    // Get old pool reserves
    const oldPool = await ethers.getContractAt("Pool", OLD_POOL);
    const [oldReserve0, oldReserve1] = await oldPool.getReserves();
    console.log(`\n📊 Old Pool reserves: ${ethers.formatEther(oldReserve0)} TKA, ${ethers.formatEther(oldReserve1)} TKB`);
    
    // Register new pool with router
    console.log("\n📝 Registering new pool with router...");
    const router = await ethers.getContractAt("Router", ROUTER);
    const registerTx = await router.registerPool(TKA, TKB, poolAddr);
    await registerTx.wait();
    console.log("   ✅ Pool registered");
    
    // Get deployer's token balances
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const balanceA = await tokenA.balanceOf(deployer.address);
    const balanceB = await tokenB.balanceOf(deployer.address);
    console.log(`\n💰 Your balances: ${ethers.formatEther(balanceA)} TKA, ${ethers.formatEther(balanceB)} TKB`);
    
    console.log("\n📋 Summary:");
    console.log(`   New Pool: ${poolAddr}`);
    console.log(`   Old Pool: ${OLD_POOL} (keep for backup)`);
    console.log(`   Router: ${ROUTER}`);
    console.log(`   TKA: ${TKA}`);
    console.log(`   TKB: ${TKB}`);
}

main().catch(console.error);
