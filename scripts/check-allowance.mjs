import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const userAddress = await user.getAddress();
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const allowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance for Router ${GASLESS_ROUTER}: ${ethers.formatEther(allowance)} TKA`);
    
    const balance = await tokenA.balanceOf(userAddress);
    console.log(`Your TKA balance: ${ethers.formatEther(balance)}`);
}

main().catch(console.error);
