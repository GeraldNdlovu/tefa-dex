import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const POOL = "0xE8Ae9E53AA159769887E140d76B4Fcdce4B144F6";
    const userAddress = await deployer.getAddress();
    
    const pool = await ethers.getContractAt("Pool", POOL);
    
    // Check LP shares
    const lpShares = await pool.lpShares(userAddress);
    const totalLpShares = await pool.totalLpShares();
    const [reserve0, reserve1] = await pool.getReserves();
    
    console.log("\n📊 Pool State:");
    console.log(`   User LP Shares: ${ethers.formatEther(lpShares)}`);
    console.log(`   Total LP Shares: ${ethers.formatEther(totalLpShares)}`);
    console.log(`   Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);
    
    if (ethers.formatEther(lpShares) === "0.0") {
        console.log("\n⚠️ You have 0 LP shares. Try adding liquidity again via UI or CLI.");
    } else {
        console.log("\n✅ You have LP shares! The frontend should display them.");
    }
}

main().catch(console.error);
