import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    // Use standard ERC20 ABI
    const erc20Abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
    ];
    
    const token = new ethers.Contract(TKA, erc20Abi, user);
    
    const allowance = await token.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance: ${ethers.formatEther(allowance)} TKA`);
    
    const balance = await token.balanceOf(userAddress);
    console.log(`Balance: ${ethers.formatEther(balance)} TKA`);
    
    // Try transferFrom
    console.log("\nAttempting transferFrom...");
    try {
        const tx = await token.transferFrom(userAddress, GASLESS_ROUTER, ethers.parseEther("0.1"));
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ Success!");
    } catch (e) {
        console.log("❌ Failed:", e.message);
        if (e.reason) console.log("Reason:", e.reason);
    }
}

main().catch(console.error);
