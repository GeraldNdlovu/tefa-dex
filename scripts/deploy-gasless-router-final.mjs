import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const FORWARDER = "0xFBbf76e7a09C22b12223DF1b341841d9ba70041f";
    const EXISTING_POOL = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    console.log("\n📦 Deploying Gasless Router...");
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(FORWARDER);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log(`   Router: ${routerAddr}`);
    
    console.log("\n📝 Registering existing pool...");
    const tx = await router.registerPool(TKA, TKB, EXISTING_POOL);
    await tx.wait();
    console.log(`   ✅ Pool registered`);
    
    console.log("\n📋 Summary:");
    console.log(`   New Router: ${routerAddr}`);
    console.log(`   Forwarder: ${FORWARDER}`);
    console.log(`   Existing Pool: ${EXISTING_POOL}`);
}
main().catch(console.error);
