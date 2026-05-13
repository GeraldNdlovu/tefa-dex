import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    // Try to call transferFrom directly with raw data
    const amount = ethers.parseEther("0.1");
    
    // Encode transferFrom: 0x23b872dd + from + to + amount
    const transferFromData = "0x23b872dd" + 
        userAddress.slice(2).padStart(64, "0") +
        GASLESS_ROUTER.slice(2).padStart(64, "0") +
        amount.toString(16).padStart(64, "0");
    
    console.log("Calling transferFrom directly...");
    try {
        const result = await ethers.provider.call({
            from: userAddress,
            to: TKA,
            data: transferFromData
        });
        console.log("Result:", result);
        console.log("✅ Raw call succeeded!");
    } catch (e) {
        console.log("❌ Raw call failed:", e.message);
    }
    
    // Check if token has a different allowance method
    const allowanceData = "0xdd62ed3e" + 
        userAddress.slice(2).padStart(64, "0") +
        GASLESS_ROUTER.slice(2).padStart(64, "0");
    
    const allowanceResult = await ethers.provider.call({
        to: TKA,
        data: allowanceData
    });
    console.log(`\nRaw allowance: ${BigInt(allowanceResult).toString()}`);
}

main().catch(console.error);
