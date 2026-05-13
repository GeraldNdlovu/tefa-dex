import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const TestReceiver = await ethers.getContractFactory("TestReceiver");
    const receiver = await TestReceiver.deploy();
    await receiver.waitForDeployment();
    
    console.log(`\n✅ TestReceiver deployed at: ${await receiver.getAddress()}`);
}
main().catch(console.error);
