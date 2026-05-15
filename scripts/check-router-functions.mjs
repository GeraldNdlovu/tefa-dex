import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const ROUTER = "0x1C12AD5634CeBE3073A73E1d79888813D4FAD301";
    
    const router = await ethers.getContractAt("Router", ROUTER);
    console.log("Router functions:", Object.keys(router.functions || {}).join(", "));
}

main().catch(console.error);
