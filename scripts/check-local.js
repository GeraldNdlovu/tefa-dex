		const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Your deployed contract addresses from the local node
    const tokenAAddress = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
    const tokenBAddress = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707";
    const routerAddress = "0x0165878a594ca255338adfa4d48449f69242eb8f";
    
    const tokenA = await ethers.getContractAt("MockERC20", tokenAAddress);
    const tokenB = await ethers.getContractAt("MockERC20", tokenBAddress);
    const router = await ethers.getContractAt("Router", routerAddress);
    
    console.log("\n📊 DEPLOYER BALANCES:");
    console.log("   Address:", deployer.address);
    console.log("   TKA:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
    console.log("   TKB:", ethers.formatEther(await tokenB.balanceOf(deployer.address)));
    console.log("   ETH:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
    
    // Get pool address
    const poolAddress = await router.getPool(tokenAAddress, tokenBAddress);
    console.log("\n📊 POOL:", poolAddress);
    
    if (poolAddress !== "0x0000000000000000000000000000000000000000") {
        const pool = await ethers.getContractAt("Pool", poolAddress);
        const reserves = await pool.getReserves();
        console.log("   Reserves - TKA:", ethers.formatEther(reserves[0]));
        console.log("   Reserves - TKB:", ethers.formatEther(reserves[1]));
    }
}

main().catch(console.error);
