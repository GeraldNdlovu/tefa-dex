import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    console.log("\n📦 Deploying TrustedForwarder...");
    console.log(`   Deployer: ${await deployer.getAddress()}`);
    
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    
    console.log(`\n✅ TrustedForwarder deployed at: ${forwarderAddr}`);
    console.log("\n⚠️  Important: You need to set this forwarder in your Router contract");
    console.log(`   Currently your Router (0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2) may not have it set`);
    console.log("\nTo update Router with this forwarder, you would need to:");
    console.log("1. Deploy a new Router with the forwarder address");
    console.log("2. Or if Router has a setTrustedForwarder function, call it");
}

main().catch(console.error);
