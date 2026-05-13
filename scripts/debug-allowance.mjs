import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const userAddress = await user.getAddress();
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    
    const allowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance: ${ethers.formatEther(allowance)} TKA`);
    
    // Try a direct transferFrom to simulate what the Router does
    const routerContract = await ethers.getContractAt("MockERC20", TKA);
    console.log("\nAttempting direct transferFrom test...");
    
    try {
        // This should work if allowance is correct
        const tx = await tokenA.transferFrom(userAddress, GASLESS_ROUTER, ethers.parseEther("0.1"));
        await tx.wait();
        console.log("✅ transferFrom succeeded!");
    } catch (e) {
        console.log("❌ transferFrom failed:", e.message);
    }
    
    // Check if the Router has the swap function
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    console.log("\nRouter functions:", Object.keys(router.functions || {}).slice(0, 5));
}

main().catch(console.error);
