import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    console.log("\n🚀 Deploying to local Hardhat network");
    console.log(`   Deployer: ${deployer.address}\n`);
    
    // 1. Deploy Forwarder
    console.log("1. Deploying TrustedForwarder...");
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    console.log(`   ✅ Forwarder: ${forwarderAddr}`);
    
    // 2. Deploy Tokens
    console.log("\n2. Deploying Tokens...");
    const Token = await ethers.getContractFactory("MockERC20");
    const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
    const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
    const tokenAAddr = await tokenA.getAddress();
    const tokenBAddr = await tokenB.getAddress();
    console.log(`   ✅ TKA: ${tokenAAddr}`);
    console.log(`   ✅ TKB: ${tokenBAddr}`);
    
    // 3. Deploy Standard Router
    console.log("\n3. Deploying Standard Router...");
    const Router = await ethers.getContractFactory("Router");
    const standardRouter = await Router.deploy(forwarderAddr);
    await standardRouter.waitForDeployment();
    const standardRouterAddr = await standardRouter.getAddress();
    console.log(`   ✅ Standard Router: ${standardRouterAddr}`);
    
    // 4. Create Pool
    console.log("\n4. Creating Pool...");
    const tx = await standardRouter.createPool(tokenAAddr, tokenBAddr);
    await tx.wait();
    const poolAddr = await standardRouter.getPool(tokenAAddr, tokenBAddr);
    console.log(`   ✅ Pool: ${poolAddr}`);
    
    // 5. Add Liquidity
    console.log("\n5. Adding Liquidity...");
    const liquidity = ethers.parseEther("10000");
    await tokenA.approve(standardRouterAddr, liquidity);
    await tokenB.approve(standardRouterAddr, liquidity);
    await standardRouter.addLiquidity(tokenAAddr, tokenBAddr, liquidity, liquidity);
    console.log(`   ✅ Liquidity added: 10,000 TKA + 10,000 TKB`);
    
    // 6. Deploy Gasless Router
    console.log("\n6. Deploying Gasless Router...");
    const gaslessRouter = await Router.deploy(forwarderAddr);
    await gaslessRouter.waitForDeployment();
    const gaslessRouterAddr = await gaslessRouter.getAddress();
    console.log(`   ✅ Gasless Router: ${gaslessRouterAddr}`);
    
    // 7. Register existing pool with Gasless Router
    console.log("\n7. Registering pool with Gasless Router...");
    const registerTx = await gaslessRouter.registerPool(tokenAAddr, tokenBAddr, poolAddr);
    await registerTx.wait();
    console.log(`   ✅ Pool registered`);
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log(`   Forwarder: ${forwarderAddr}`);
    console.log(`   TKA: ${tokenAAddr}`);
    console.log(`   TKB: ${tokenBAddr}`);
    console.log(`   Standard Router: ${standardRouterAddr}`);
    console.log(`   Gasless Router: ${gaslessRouterAddr}`);
    console.log(`   Pool: ${poolAddr}`);
    console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
