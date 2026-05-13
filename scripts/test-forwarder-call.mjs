import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    const FORWARDER = "0x83444DDC3015F1382E2a27E291c3B5978B6F6c42";
    
    // Create a simple contract instance
    const forwarder = new ethers.Contract(
        FORWARDER,
        [
            "function nonces(address) view returns (uint256)",
            "function execute(address,address,uint256,uint256,uint256,bytes,bytes) returns (bool)"
        ],
        ethers.provider
    );
    
    try {
        const nonce = await forwarder.nonces(await deployer.getAddress());
        console.log("✅ Nonce:", nonce.toString());
    } catch (e) {
        console.log("❌ Nonce failed:", e.message);
    }
    
    // Check if execute exists
    const code = await ethers.provider.getCode(FORWARDER);
    console.log("Contract code length:", code.length);
}
main().catch(console.error);
