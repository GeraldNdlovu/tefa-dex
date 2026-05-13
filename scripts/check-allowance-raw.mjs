import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const userAddress = await user.getAddress();
    
    // Call the allowance function directly via provider
    const allowanceData = "0xdd62ed3e" + userAddress.slice(2).padStart(64, "0") + GASLESS_ROUTER.slice(2).padStart(64, "0");
    
    const result = await ethers.provider.call({
        to: TKA,
        data: allowanceData
    });
    
    const allowance = BigInt(result);
    console.log(`Raw allowance: ${allowance.toString()}`);
    console.log(`Allowance as TKA: ${ethers.formatEther(allowance)}`);
    
    // Also check user balance
    const balanceData = "0x70a08231" + userAddress.slice(2).padStart(64, "0");
    const balanceResult = await ethers.provider.call({
        to: TKA,
        data: balanceData
    });
    console.log(`Balance: ${ethers.formatEther(balanceResult)} TKA`);
}

main().catch(console.error);
