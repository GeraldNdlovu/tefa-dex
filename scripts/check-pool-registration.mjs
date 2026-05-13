import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const EXISTING_POOL = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";
    
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    
    // Check TKA/TKB pool
    const poolTKA_TKB = await router.getPool(TKA, TKB);
    console.log(`Pool TKA/TKB: ${poolTKA_TKB}`);
    console.log(`Expected pool: ${EXISTING_POOL}`);
    console.log(`Match: ${poolTKA_TKB.toLowerCase() === EXISTING_POOL.toLowerCase()}`);
    
    // Also check reverse
    const poolTKB_TKA = await router.getPool(TKB, TKA);
    console.log(`\nPool TKB/TKA: ${poolTKB_TKA}`);
}

main().catch(console.error);
