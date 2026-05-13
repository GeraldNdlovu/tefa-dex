import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    
    // Get the allowance again
    const allowance = await token.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance for Router: ${ethers.formatEther(allowance)} TKA`);
    
    // Get the signer for the user
    const signer = await ethers.getSigner(userAddress);
    
    // Call transferFrom directly as the user (this is what the Router would do, but the Router is the contract)
    // Actually, the Router calls transferFrom, not the user. So let's simulate this differently.
    
    // Get the Router contract instance
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    
    // Check if Router has a function to test transfer
    console.log("\nIs Router approved?", allowance > 0);
    
    // Try to call a simple function to see if Router is paused
    try {
        const pool = await router.getPool(TKA, TKA);
        console.log("Router is responsive, pool:", pool);
    } catch (e) {
        console.log("Router error:", e.message);
    }
}

main().catch(console.error);
