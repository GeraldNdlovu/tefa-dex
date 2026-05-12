import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    console.log("Checking for TrustedForwarder...");
    const forwarderAddr = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const code = await ethers.provider.getCode(forwarderAddr);
    console.log(code.length > 2 ? "✅ Forwarder exists" : "❌ Need to deploy");
    if (code.length > 2) {
        console.log(`   Address: ${forwarderAddr}`);
    }
}
main().catch(console.error);
