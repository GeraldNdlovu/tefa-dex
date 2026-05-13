import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const TKA = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const randomSpender = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Second Hardhat account
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    
    // Approve the random spender
    console.log("Approving random spender...");
    await token.approve(randomSpender, ethers.parseEther("100"));
    const allowance = await token.allowance(userAddress, randomSpender);
    console.log("Allowance for random spender:", ethers.formatEther(allowance), "TKA");
    
    // Try transferFrom using the random spender
    console.log("\nAttempting transferFrom with random spender...");
    try {
        // Impersonate the random spender
        const randomSigner = await ethers.getImpersonatedSigner(randomSpender);
        const tokenWithRandom = token.connect(randomSigner);
        const tx = await tokenWithRandom.transferFrom(userAddress, randomSpender, ethers.parseEther("10"));
        console.log("Tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded with random spender!");
    } catch (e) {
        console.log("❌ transferFrom failed with random spender:", e.message);
    }
}

main().catch(console.error);
