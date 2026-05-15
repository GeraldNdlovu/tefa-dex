import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const FORWARDER = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    console.log("\n🚀 Deploying new Router and Pool...");
    
    // Deploy new Pool
    console.log("1. Deploying new Pool...");
    const Pool = await ethers.getContractFactory("Pool");
    const pool = await Pool.deploy(TKA, TKB);
    await pool.waitForDeployment();
    const poolAddr = await pool.getAddress();
    console.log(`   ✅ New Pool: ${poolAddr}`);
    
    // Deploy new Router
    console.log("\n2. Deploying new Router...");
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(FORWARDER);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log(`   ✅ New Router: ${routerAddr}`);
    
    // Register pool with router
    console.log("\n3. Registering pool with router...");
    const registerTx = await router.registerPool(TKA, TKB, poolAddr);
    await registerTx.wait();
    console.log("   ✅ Pool registered");
    
    // Add initial liquidity (optional)
    console.log("\n4. Adding initial liquidity...");
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const liquidityAmount = ethers.parseEther("1000");
    
    await tokenA.approve(routerAddr, liquidityAmount);
    await tokenB.approve(routerAddr, liquidityAmount);
    const addLiqTx = await router.addLiquidity(TKA, TKB, liquidityAmount, liquidityAmount);
    await addLiqTx.wait();
    console.log("   ✅ Initial liquidity added: 1,000 TKA + 1,000 TKB");
    
    console.log("\n📋 DEPLOYMENT COMPLETE!");
    console.log("   New Router:", routerAddr);
    console.log("   New Pool:", poolAddr);
    console.log("   Forwarder:", FORWARDER);
    console.log("   TKA:", TKA);
    console.log("   TKB:", TKB);
}

main().catch(console.error);
