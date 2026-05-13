import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    // Use MockERC20 ABI
    const token = await ethers.getContractAt("MockERC20", TKA);
    const allowance = await token.allowance(userAddress, GASLESS_ROUTER);
    console.log(`\nToken.allowance() returns: ${ethers.formatEther(allowance)} TKA`);
    
    // Attempt transferFrom with proper gas
    console.log("\nAttempting transferFrom...");
    const amount = ethers.parseEther("0.1");
    
    try {
        const tx = await token.transferFrom(userAddress, GASLESS_ROUTER, amount);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded!");
    } catch (e) {
        console.log("❌ Failed:", e.message);
        
        // Decode the revert reason if possible
        if (e.data && e.data !== "0x") {
            console.log("Raw revert data:", e.data);
        }
    }
}

main().catch(console.error);
