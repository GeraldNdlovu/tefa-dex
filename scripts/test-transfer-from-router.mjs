import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const randomAddress = ethers.Wallet.createRandom().address;
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    
    // Approve the random address
    console.log(`Approving ${randomAddress}...`);
    await token.approve(randomAddress, ethers.parseEther("100"));
    
    // Try transferFrom from user to random address using random address as spender
    console.log("\nAttempting transferFrom with random spender...");
    try {
        const randomSigner = new ethers.Wallet(randomAddress, ethers.provider);
        const tokenWithRandom = token.connect(randomSigner);
        const tx = await tokenWithRandom.transferFrom(userAddress, randomAddress, ethers.parseEther("0.1"));
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded with random spender!");
    } catch (e) {
        console.log("❌ Failed with random spender:", e.message);
    }
    
    // Now check Router again
    console.log("\nChecking Router allowance again...");
    const allowance = await token.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Router allowance: ${ethers.formatEther(allowance)} TKA`);
}

main().catch(console.error);
