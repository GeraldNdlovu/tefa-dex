import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const TKA = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    
    // Try direct transferFrom
    console.log("Attempting direct transferFrom from user to router...");
    try {
        const tx = await token.transferFrom(userAddress, GASLESS_ROUTER, ethers.parseEther("0.5"));
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded!");
    } catch (e) {
        console.log("❌ transferFrom failed:", e.message);
    }
}

main().catch(console.error);
