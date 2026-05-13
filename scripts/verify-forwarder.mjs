import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const FORWARDER = "0xFBbf76e7a09C22b12223DF1b341841d9ba70041f";
    
    // Get the runtime bytecode
    const code = await ethers.provider.getCode(FORWARDER);
    console.log("Contract code length:", code.length);
    console.log("Has code:", code.length > 2);
    
    // Check if nonces function exists by calling it
    const noncesData = "0x" + "nonces(address)".slice(0, 10);
    console.log("Attempting to call nonces...");
    
    try {
        const result = await ethers.provider.call({
            to: FORWARDER,
            data: "0x" + "f7cee8f2".padEnd(40, "0")
        });
        console.log("Nonces call returned:", result);
    } catch (e) {
        console.log("Nonces call failed:", e.message);
    }
}
main().catch(console.error);
