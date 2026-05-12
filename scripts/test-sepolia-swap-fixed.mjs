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
    
    // Get balances before
    const tkaBefore = await tokenA.balanceOf(address);
    const tkbBefore = await tokenB.balanceOf(address);
    
    console.log("\n📊 BEFORE SWAP:");
    console.log(`   TKA: ${ethers.formatEther(tkaBefore)}`);
    console.log(`   TKB: ${ethers.formatEther(tkbBefore)}`);
    
    const swapAmount = ethers.parseEther("1");
    console.log(`\n💱 Swapping 1 TKA for TKB...`);
    
    // Approve and swap
    let tx = await tokenA.approve(ROUTER, swapAmount);
    await tx.wait();
    
    tx = await router.swap(TKA, TKB, swapAmount);
    await tx.wait();
    
    // Get balances after
    const tkaAfter = await tokenA.balanceOf(address);
    const tkbAfter = await tokenB.balanceOf(address);
    
    console.log("\n📊 AFTER SWAP:");
    console.log(`   TKA: ${ethers.formatEther(tkaAfter)}`);
    console.log(`   TKB: ${ethers.formatEther(tkbAfter)}`);
    
    // Calculate what you received
    const tkaSpent = tkaBefore - tkaAfter;
    const tkbReceived = tkbAfter - tkbBefore;
    
    console.log(`\n✅ Swapped ${ethers.formatEther(tkaSpent)} TKA for ${ethers.formatEther(tkbReceived)} TKB`);
    console.log(`   Rate: 1 TKA = ${ethers.formatEther(tkbReceived)} TKB`);
}

main().catch(console.error);
