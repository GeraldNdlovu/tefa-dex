const { ethers } = require("hardhat");

async function main() {
    const [user] = await ethers.getSigners();
    console.log("User address:", user.address);
    
    const TKB_ADDRESS = "0x6644F_2eD2C"; // From your screenshot
    const ROUTER_ADDRESS = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a"; // The pool address from your check
    
    const tkb = await ethers.getContractAt("IERC20", TKB_ADDRESS);
    
    const maxAmount = ethers.parseEther("1000000");
    const tx = await tkb.approve(ROUTER_ADDRESS, maxAmount);
    console.log("Tx hash:", tx.hash);
    await tx.wait();
    
    console.log("✓ TKB approved. Now try swapping TKB to TKA again.");
}

main().catch(console.error);
