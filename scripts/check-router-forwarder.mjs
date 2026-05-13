import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const GASLESS_ROUTER = "0x6d8F0dA6d5d9753699060e88cAaE121F18597530";
    const FORWARDER = "0x0DA5A16B6fF7C4A9DAf7491A9b8811fc0fA2271F";
    
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    
    // Try to get the forwarder address
    try {
        const forwarder = await router.trustedForwarder();
        console.log("\n🔍 Router's TrustedForwarder:", forwarder);
        console.log("   Expected Forwarder:", FORWARDER);
        
        if (forwarder.toLowerCase() === FORWARDER.toLowerCase()) {
            console.log("   ✅ Forwarder is correctly set!");
        } else {
            console.log("   ❌ Forwarder mismatch!");
        }
    } catch (error) {
        console.log("\n⚠️ Router doesn't have trustedForwarder() getter");
        console.log("   The Router constructor was called with:", FORWARDER);
        console.log("   But we can't verify it directly");
    }
}

main().catch(console.error);
