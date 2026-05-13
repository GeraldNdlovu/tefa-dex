import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const RELAYER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";
    const amount = ethers.parseEther("10");
    
    console.log("Sending 10 ETH to relayer...");
    const tx = await deployer.sendTransaction({
        to: RELAYER_ADDRESS,
        value: amount
    });
    await tx.wait();
    console.log("✅ Relayer funded!");
}

main().catch(console.error);
