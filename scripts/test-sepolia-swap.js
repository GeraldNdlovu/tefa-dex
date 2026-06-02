const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const walletAddress = await signer.getAddress();
    
    // Token addresses (from your .env or deployment)
    const TKA_ADDRESS = "0x..."; // Replace with your TKA address
    const TKB_ADDRESS = "0x..."; // Replace with your TKB address
    const ROUTER_ADDRESS = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
    
    const tka = await ethers.getContractAt("IERC20", TKA_ADDRESS);
    const tkb = await ethers.getContractAt("IERC20", TKB_ADDRESS);
    const router = await ethers.getContractAt("Router", ROUTER_ADDRESS);
    
    // Get balances before
    const tkaBefore = await tka.balanceOf(walletAddress);
    const tkbBefore = await tkb.balanceOf(walletAddress);
    
    console.log(`TKA balance before: ${ethers.formatEther(tkaBefore)}`);
    console.log(`TKB balance before: ${ethers.formatEther(tkbBefore)}`);
    
    // Approve
    console.log("Approving...");
    const approveTx = await tka.approve(ROUTER_ADDRESS, ethers.parseEther("1"));
    await approveTx.wait();
    
    // Swap 1 TKA for TKB
    const swapAmount = ethers.parseEther("1");
    const minTkbOut = 0; // Set minimum expected output
    
    console.log("Swapping 1 TKA for TKB...");
    const swapTx = await router.swapExactTokensForTokens(
        swapAmount,
        minTkbOut,
        [TKA_ADDRESS, TKB_ADDRESS],
        walletAddress,
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes deadline
    );
    await swapTx.wait();
    
    // Get balances after
    const tkaAfter = await tka.balanceOf(walletAddress);
    const tkbAfter = await tkb.balanceOf(walletAddress);
    
    console.log(`TKA balance after: ${ethers.formatEther(tkaAfter)}`);
    console.log(`TKB balance after: ${ethers.formatEther(tkbAfter)}`);
    console.log(`TKB received: ${ethers.formatEther(tkbAfter - tkbBefore)}`);
    console.log(`Swap rate: ~${ethers.formatEther(tkbAfter - tkbBefore)} TKB per TKA`);
    console.log("✅ Swap successful!");
}

main().catch(console.error);
