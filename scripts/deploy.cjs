const hre = require("hardhat");

async function main() {
    console.log("\n========================================");
    console.log("🚀 TEFA DEX - FULL DEPLOYMENT");
    console.log("========================================\n");
    
    const { ethers } = hre;
    
    const [deployer] = await ethers.getSigners();
    console.log("📡 Deployer:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // PHASE 1: Deploy Fee Infrastructure
    console.log("📦 PHASE 1: Deploying Fee Infrastructure...");
    
    const FeeSubsidyPool = await ethers.getContractFactory("FeeSubsidyPool");
    const feeSubsidyPool = await FeeSubsidyPool.deploy();
    await feeSubsidyPool.waitForDeployment();
    console.log("   ✅ FeeSubsidyPool:", await feeSubsidyPool.getAddress());
    
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
    console.log("   ✅ Treasury:", await treasury.getAddress());
    
    const FeeCollector = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollector.deploy(
        await treasury.getAddress(),
        await feeSubsidyPool.getAddress()
    );
    await feeCollector.waitForDeployment();
    console.log("   ✅ FeeCollector:", await feeCollector.getAddress());

    // PHASE 2: Deploy TrustedForwarder
    console.log("\n📦 PHASE 2: Deploying Forwarder...");
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    console.log("   ✅ TrustedForwarder:", await forwarder.getAddress());

    // PHASE 3: Deploy Tokens
    console.log("\n📦 PHASE 3: Deploying Tokens...");
    const Token = await ethers.getContractFactory("MockERC20");
    const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
    const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
    console.log("   ✅ TokenA (TKA):", await tokenA.getAddress());
    console.log("   ✅ TokenB (TKB):", await tokenB.getAddress());

    // PHASE 4: Deploy Router
    console.log("\n📦 PHASE 4: Deploying Router...");
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(await forwarder.getAddress());
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("   ✅ Router:", routerAddr);

    // PHASE 5: Create Pool
    console.log("\n📦 PHASE 5: Creating Pool...");
    const tokenAAddr = await tokenA.getAddress();
    const tokenBAddr = await tokenB.getAddress();
    
    const createPoolTx = await router.createPool(tokenAAddr, tokenBAddr);
    await createPoolTx.wait();
    const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
    console.log("   ✅ Pool:", poolAddr);

    // PHASE 6: Add Initial Liquidity
    console.log("\n📦 PHASE 6: Adding Initial Liquidity...");
    const liquidityAmount = ethers.parseEther("10000");
    
    console.log("   Approving Router to spend tokens...");
    await tokenA.approve(routerAddr, liquidityAmount);
    await tokenB.approve(routerAddr, liquidityAmount);
    
    console.log("   Adding liquidity...");
    await router.addLiquidity(tokenAAddr, tokenBAddr, liquidityAmount, liquidityAmount);
    
    console.log("\n🎉 TEFA DEX deployed and seeded successfully!");
    console.log("========================================");
    console.log("📋 Contract Addresses:");
    console.log("   Router:", routerAddr);
    console.log("   TokenA:", tokenAAddr);
    console.log("   TokenB:", tokenBAddr);
    console.log("   Pool:", poolAddr);
    console.log("   Forwarder:", await forwarder.getAddress());
    console.log("   FeeCollector:", await feeCollector.getAddress());
    console.log("   Treasury:", await treasury.getAddress());
    console.log("   FeeSubsidyPool:", await feeSubsidyPool.getAddress());
    console.log("========================================\n");
}

main().catch((error) => {
    console.error("❌ Deployment failed!");
    console.error(error);
    process.exitCode = 1;
});
