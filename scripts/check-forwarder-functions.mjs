import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const FORWARDER = "0xFBbf76e7a09C22b12223DF1b341841d9ba70041f";
    const forwarder = await ethers.getContractAt("TrustedForwarder", FORWARDER);
    console.log("\n🔍 Forwarder functions:", Object.keys(forwarder.functions || {}));
}
main().catch(console.error);
