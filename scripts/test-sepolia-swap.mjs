import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const router = await ethers.getContractAt("Router", ROUTER);
    const [deployer] = await ethers.getSigners();
    
    const address = await deployer.getAddress();
    
    console.log("\n📊 BEFORE SWAP:");
    console.log(`   TKA balance: ${ethers.formatEther(await tokenA.balanceOf(address))}`);
    console.log(`   TKB balance: ${ethers.formatEther(await tokenB.balanceOf(address))}`);
    
    const swapAmount = ethers.parseEther("1");
    console.log(`\n💱 Swapping 1 TKA for TKB...`);
    
    // Approve router to spend TKA
    console.log("   Approving...");
    let tx = await tokenA.approve(ROUTER, swapAmount);
    await tx.wait();
    
    // Execute swap
    tx = await router.swap(TKA, TKB, swapAmount);
    await tx.wait();
    
    console.log("\n📊 AFTER SWAP:");
    console.log(`   TKA balance: ${ethers.formatEther(await tokenA.balanceOf(address))}`);
    console.log(`   TKB balance: ${ethers.formatEther(await tokenB.balanceOf(address))}`);
    
    // Calculate how much TKB you received
    const finalTKB = await tokenB.balanceOf(address);
    const initialTKB = ethers.parseEther("992010.193165643780003662");
    const tkbReceived = finalTKB - initialTKB;
    
    console.log(`\n✅ Swap successful! Received ${ethers.formatEther(tkbReceived)} TKB`);
}

main().catch(console.error);
