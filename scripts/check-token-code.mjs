import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    const code = await ethers.provider.getCode(TKA);
    console.log("Token code length:", code.length);
    console.log("Is contract:", code.length > 2);
    
    // Get the token's functions
    const token = await ethers.getContractAt("MockERC20", TKA);
    console.log("Token functions:", Object.keys(token.functions || {}).slice(0, 10));
}

main().catch(console.error);
