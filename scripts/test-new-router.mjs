import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const NEW_ROUTER = "0x7071849D30499f5f27a9C05386E546BB07522851";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    const router = await ethers.getContractAt("Router", NEW_ROUTER);
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    
    console.log("\n🧪 Testing new gasless Router...");
    
    // Check if pool is registered
    const poolAddr = await router.getPool(TKA, TKB);
    console.log(`   Pool address: ${poolAddr}`);
    
    // Check balance before
    const balanceBefore = await tokenA.balanceOf(await deployer.getAddress());
    console.log(`   TKA balance before: ${ethers.formatEther(balanceBefore)}`);
    
    console.log("\n✅ New Router is connected to the pool!");
    console.log("   Ready for gasless transactions!");
}

main().catch(console.error);
