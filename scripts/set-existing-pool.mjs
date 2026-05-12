import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const NEW_ROUTER = "0x7071849D30499f5f27a9C05386E546BB07522851";
    const EXISTING_POOL = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    const router = await ethers.getContractAt("Router", NEW_ROUTER);
    
    console.log("\n🔧 Attempting to set existing pool...");
    
    // Check if Router has a way to set pool mapping
    const functions = Object.keys(router.functions || {});
    console.log("Router functions:", functions.join(", "));
    
    // Try to directly set the mapping (if possible)
    try {
        // This might not work depending on Router implementation
        console.log("\n⚠️ Router may not have a function to register existing pools");
        console.log("Alternative: Deploy a new Router that references the existing pool");
    } catch (e) {
        console.log("Error:", e.message);
    }
}
main();
