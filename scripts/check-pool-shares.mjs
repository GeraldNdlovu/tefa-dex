import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
    const pool = await ethers.getContractAt("Pool", POOL);
    
    const shares = await pool.lpShares(deployer.address);
    console.log("Your LP shares:", ethers.formatEther(shares));
    
    const totalShares = await pool.totalLpShares();
    console.log("Total LP shares:", ethers.formatEther(totalShares));
    
    const [reserve0, reserve1] = await pool.getReserves();
    console.log("Reserves:", ethers.formatEther(reserve0), "TKA,", ethers.formatEther(reserve1), "TKB");
}

main().catch(console.error);
