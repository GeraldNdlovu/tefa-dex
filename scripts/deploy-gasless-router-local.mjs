import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const FORWARDER = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const TKA = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const TKB = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    const EXISTING_POOL = "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1";
    
    console.log("\n📦 Deploying Gasless Router locally...");
    const Router = await ethers.getContractFactory("Router");
    const gaslessRouter = await Router.deploy(FORWARDER);
    await gaslessRouter.waitForDeployment();
    const gaslessRouterAddr = await gaslessRouter.getAddress();
    console.log(`   Gasless Router: ${gaslessRouterAddr}`);
    
    console.log("\n📝 Registering existing pool...");
    const tx = await gaslessRouter.registerPool(TKA, TKB, EXISTING_POOL);
    await tx.wait();
    console.log(`   ✅ Pool registered`);
    
    console.log("\n📋 Summary:");
    console.log(`   Gasless Router: ${gaslessRouterAddr}`);
    console.log(`   Forwarder: ${FORWARDER}`);
    console.log(`   Pool: ${EXISTING_POOL}`);
    console.log(`   TKA: ${TKA}`);
    console.log(`   TKB: ${TKB}`);
    
    // Save addresses for later use
    console.log("\n💾 Save these addresses for the gasless swap test:");
    console.log(`GASLESS_ROUTER=${gaslessRouterAddr}`);
    console.log(`FORWARDER=${FORWARDER}`);
    console.log(`TKA=${TKA}`);
    console.log(`TKB=${TKB}`);
}

main().catch(console.error);
