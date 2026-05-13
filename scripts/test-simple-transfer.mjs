import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    
    // Get user balance
    const balance = await token.balanceOf(userAddress);
    console.log(`User balance: ${ethers.formatEther(balance)} TKA`);
    
    // Try regular transfer (not transferFrom) to another address
    const randomAddress = "0x0000000000000000000000000000000000000001";
    
    console.log(`\nAttempting regular transfer of 0.1 TKA to ${randomAddress}...`);
    try {
        const tx = await token.transfer(randomAddress, ethers.parseEther("0.1"));
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ Transfer succeeded!");
    } catch (e) {
        console.log("❌ Transfer failed:", e.message);
    }
}

main().catch(console.error);
