import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    console.log("\n📦 Deploying TrustedForwarder...");
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    
    console.log(`\n✅ TrustedForwarder deployed at: ${forwarderAddr}`);
    console.log(`   Deployer: ${await deployer.getAddress()}`);
    console.log("\n⚠️ IMPORTANT: Update your relayer .env with this new address!");
}

main().catch(console.error);
