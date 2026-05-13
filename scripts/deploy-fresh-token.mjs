import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    // Deploy a completely fresh token with a different name
    const Token = await ethers.getContractFactory("MockERC20");
    const freshToken = await Token.deploy("FreshToken", "FRESH", ethers.parseEther("1000000"));
    await freshToken.waitForDeployment();
    const freshTokenAddr = await freshToken.getAddress();
    console.log("Fresh Token:", freshTokenAddr);
    
    // Test allowance and transferFrom immediately
    const routerAddr = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const userAddress = await deployer.getAddress();
    
    console.log("\nTesting fresh token...");
    await freshToken.approve(routerAddr, ethers.parseEther("100"));
    const allowance = await freshToken.allowance(userAddress, routerAddr);
    console.log("Allowance:", ethers.formatEther(allowance), "FRESH");
    
    try {
        const tx = await freshToken.transferFrom(userAddress, routerAddr, ethers.parseEther("10"));
        console.log("Tx hash:", tx.hash);
        await tx.wait();
        console.log("✅ transferFrom succeeded on fresh token!");
    } catch (e) {
        console.log("❌ transferFrom failed on fresh token:", e.message);
    }
}

main().catch(console.error);
