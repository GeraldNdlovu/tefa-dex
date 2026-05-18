const { ethers } = require("hardhat");

async function main() {
    const [user] = await ethers.getSigners();
    console.log("User address:", user.address);
    
    const TKB_ADDRESS = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    const ROUTER_ADDRESS = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
    
    const tkb = await ethers.getContractAt("IERC20", TKB_ADDRESS);
    
    const maxAmount = ethers.parseEther("1000000");
    const tx = await tkb.approve(ROUTER_ADDRESS, maxAmount);
    console.log("Tx hash:", tx.hash);
    await tx.wait();
    
    console.log("✓ TKB approved. Now try swapping TKB to TKA.");
}

main().catch(console.error);
