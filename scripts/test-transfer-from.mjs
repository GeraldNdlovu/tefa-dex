import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const userAddress = await user.getAddress();
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    
    // Get the current allowance again
    const allowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance: ${ethers.formatEther(allowance)} TKA`);
    
    // Get the signer
    const signer = await ethers.getSigner(userAddress);
    
    // Try to send a transaction directly from user to router via transferFrom
    console.log("\nAttempting transferFrom with explicit gas...");
    
    try {
        const tx = await tokenA.connect(signer).transferFrom(
            userAddress,
            GASLESS_ROUTER,
            ethers.parseEther("0.1"),
            { gasLimit: 100000 }
        );
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded!");
    } catch (e) {
        console.log("❌ transferFrom failed:", e.message);
        if (e.reason) console.log("Reason:", e.reason);
    }
}

main().catch(console.error);
