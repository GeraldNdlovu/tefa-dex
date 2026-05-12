import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const FORWARDER = "0x0DA5A16B6fF7C4A9DAf7491A9b8811fc0fA2271F";
    const EXISTING_POOL = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    console.log("\n📦 Deploying Gasless Router...");
    console.log(`   Forwarder: ${FORWARDER}`);
    
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(FORWARDER);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    
    console.log(`\n✅ New Router deployed: ${routerAddr}`);
    
    // Connect to existing pool
    console.log("\n🔗 Connecting to existing pool...");
    const pool = await ethers.getContractAt("Pool", EXISTING_POOL);
    
    // Register the pool with the new router
    console.log("   Registering pool with new router...");
    const tx = await router.createPool(TKA, TKB);
    await tx.wait();
    
    console.log("\n✅ Gasless Router is ready!");
    console.log("\n📋 Summary:");
    console.log(`   New Router: ${routerAddr}`);
    console.log(`   Forwarder: ${FORWARDER}`);
    console.log(`   Existing Pool: ${EXISTING_POOL}`);
    console.log(`   TKA: ${TKA}`);
    console.log(`   TKB: ${TKB}`);
    
    console.log("\n⚠️  IMPORTANT:");
    console.log("   Both routers now work with the same pool!");
    console.log(`   Old Router: 0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2`);
    console.log(`   New Router: ${routerAddr}`);
}

main().catch(console.error);
