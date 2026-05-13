import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x2dddce1A5F81D0f2808e48399103592a57CCA8c6";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const userAddress = await user.getAddress();
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    
    // Check allowance directly
    const allowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance for Gasless Router: ${ethers.formatEther(allowance)} TKA`);
    
    if (allowance === 0n) {
        console.log("Approving...");
        const approveTx = await tokenA.approve(GASLESS_ROUTER, ethers.parseEther("10"));
        await approveTx.wait();
        console.log("Approved!");
    } else {
        console.log("Already approved");
    }
    
    const newAllowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`New allowance: ${ethers.formatEther(newAllowance)} TKA`);
}

main().catch(console.error);
