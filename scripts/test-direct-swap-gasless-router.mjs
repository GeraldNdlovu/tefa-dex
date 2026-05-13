import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    
    const GASLESS_ROUTER = "0x2dddce1A5F81D0f2808e48399103592a57CCA8c6";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    console.log("\n🧪 Testing direct swap through Gasless Router...");
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    const userAddress = await user.getAddress();
    
    const balanceBefore = await tokenA.balanceOf(userAddress);
    console.log(`TKA before: ${ethers.formatEther(balanceBefore)}`);
    
    // Approve
    console.log("Approving...");
    const approveTx = await tokenA.approve(GASLESS_ROUTER, ethers.parseEther("1"));
    await approveTx.wait();
    
    // Direct swap with manual gas
    console.log("Swapping...");
    const gasPrice = await ethers.provider.getFeeData();
    const tx = await router.swap(TKA, TKB, ethers.parseEther("1"), {
        gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 2n : undefined,
        gasLimit: 300000
    });
    await tx.wait();
    
    const balanceAfter = await tokenA.balanceOf(userAddress);
    console.log(`TKA after: ${ethers.formatEther(balanceAfter)}`);
    console.log(`TKA spent: ${ethers.formatEther(balanceBefore - balanceAfter)}`);
    console.log("\n✅ Direct swap works!");
}

main().catch(console.error);
