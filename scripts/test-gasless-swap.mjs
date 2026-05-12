import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x6d8F0dA6d5d9753699060e88cAaE121F18597530";
    const FORWARDER = "0x0DA5A16B6fF7C4A9DAf7491A9b8811fc0fA2271F";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    console.log("\n🧪 Testing gasless swap flow...");
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    const forwarder = await ethers.getContractAt("TrustedForwarder", FORWARDER);
    
    const address = await deployer.getAddress();
    const balanceBefore = await tokenA.balanceOf(address);
    console.log(`\n📊 Balance before: ${ethers.formatEther(balanceBefore)} TKA`);
    
    // Approve router to spend TKA
    console.log("\n1️⃣ Approving Router...");
    const approveTx = await tokenA.approve(GASLESS_ROUTER, ethers.parseEther("1"));
    await approveTx.wait();
    console.log("   ✅ Approved");
    
    // Normal swap (for comparison)
    console.log("\n2️⃣ Executing swap via gasless Router...");
    const swapTx = await router.swap(TKA, TKB, ethers.parseEther("1"));
    await swapTx.wait();
    console.log("   ✅ Swap executed");
    
    const balanceAfter = await tokenA.balanceOf(address);
    console.log(`\n📊 Balance after: ${ethers.formatEther(balanceAfter)} TKA`);
    console.log(`   TKA spent: ${ethers.formatEther(balanceBefore - balanceAfter)}`);
    
    console.log("\n✅ Gasless Router works with existing pool!");
    console.log("\n⚠️  Next step: Create actual meta-transaction without paying gas");
}

main().catch(console.error);
