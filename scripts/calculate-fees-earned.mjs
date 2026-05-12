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
    const poolAddr = await router.getPool(TKA, TKB);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    
    // Current state
    const reserves = await pool.getReserves();
    const yourTKA = await tokenA.balanceOf(address);
    const yourTKB = await tokenB.balanceOf(address);
    
    // Your initial deposit (from earlier)
    const initialDepositTKA = ethers.parseEther("986476.0");
    const initialDepositTKB = ethers.parseEther("991010.193165643780003662");
    
    // Calculate expected if no fees
    const tkaSpent = initialDepositTKA - yourTKA;
    const tkbReceivedNoFees = ethers.parseEther("2.65"); // Approximate
    
    // Actual TKB received (including fees)
    const tkbReceivedActual = yourTKB - initialDepositTKB;
    
    console.log("\n" + "=".repeat(55));
    console.log("💰 FEE EARNINGS CALCULATION");
    console.log("=".repeat(55));
    
    console.log("\n📊 Your Activity:");
    console.log(`   TKA Swapped Out: ${ethers.formatEther(tkaSpent)}`);
    console.log(`   TKB Received (actual): ${ethers.formatEther(tkbReceivedActual)}`);
    
    // Pool fees (0.3% of swap volume)
    const swapVolume = Number(ethers.formatEther(tkaSpent)) * 0.6624; // Approx TKB value
    const totalFees = swapVolume * 0.003;
    const yourFees = totalFees * 0.0926; // Your 9.26% share
    
    console.log("\n💸 Estimated Fees Earned:");
    console.log(`   Total swap volume: ~$${swapVolume.toFixed(2)}`);
    console.log(`   Total fees (0.3%): $${totalFees.toFixed(4)}`);
    console.log(`   Your share (9.26%): $${yourFees.toFixed(4)}`);
    
    console.log("\n📈 Your LP Value:");
    const yourValue = Number(ethers.formatEther(yourTKA)) + (Number(ethers.formatEther(yourTKB)) * 1.5053);
    const initialValue = 986476 + (991010.19 * 1.5053);
    console.log(`   Initial value: $${initialValue.toFixed(2)}`);
    console.log(`   Current value: $${yourValue.toFixed(2)}`);
    console.log(`   Profit/Loss: $${(yourValue - initialValue).toFixed(4)}`);
    
    console.log("\n" + "=".repeat(55));
}

main().catch(console.error);
