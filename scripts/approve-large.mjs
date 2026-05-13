import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    
    // Approve a large amount
    const largeAmount = ethers.parseEther("10000");
    console.log(`Approving ${ethers.formatEther(largeAmount)} TKA to Router...`);
    const approveTx = await tokenA.approve(GASLESS_ROUTER, largeAmount);
    await approveTx.wait();
    console.log("✅ Approved!");
    
    // Check allowance
    const allowance = await tokenA.allowance(await user.getAddress(), GASLESS_ROUTER);
    console.log(`New allowance: ${ethers.formatEther(allowance)} TKA`);
}

main().catch(console.error);
