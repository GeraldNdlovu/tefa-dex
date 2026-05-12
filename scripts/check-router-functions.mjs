import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const routerAddr = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    const router = await ethers.getContractAt("Router", routerAddr);
    
    console.log("\n🔍 Checking Router functions...");
    const allFunctions = Object.keys(router.functions || {});
    console.log("Available functions:", allFunctions.join(", "));
    
    if (allFunctions.includes("setTrustedForwarder")) {
        console.log("\n✅ Router has setTrustedForwarder function!");
    } else {
        console.log("\n❌ Router does NOT have setTrustedForwarder function");
        console.log("   You would need to deploy a new Router with the forwarder");
    }
}

main().catch(console.error);
