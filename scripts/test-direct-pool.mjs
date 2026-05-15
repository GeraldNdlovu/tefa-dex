import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    
    const POOL = "0x553732A2730291e044dF7f25F5126B61f057b041";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const tokenB = await ethers.getContractAt("MockERC20", TKB);
    const pool = await ethers.getContractAt("Pool", POOL);
    
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Nonce: ${nonce}`);
    
    const amount = ethers.parseEther("1");
    
    // Check balances
    const balanceA = await tokenA.balanceOf(deployer.address);
    const balanceB = await tokenB.balanceOf(deployer.address);
    console.log(`TKA balance: ${ethers.formatEther(balanceA)}`);
    console.log(`TKB balance: ${ethers.formatEther(balanceB)}`);
    
    // Approve the POOL directly (not router)
    console.log(`\nApproving Pool to spend TKA...`);
    let tx = await tokenA.approve(POOL, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    console.log(`Approving Pool to spend TKB...`);
    tx = await tokenB.approve(POOL, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    let sharesBefore = await pool.lpShares(deployer.address);
    console.log(`\nShares before: ${ethers.formatEther(sharesBefore)}`);
    
    // Add liquidity directly to pool
    console.log(`\nAdding 1 TKA + 1 TKB directly to pool...`);
    tx = await pool.addLiquidity(amount, amount, { nonce: nonce++, gasPrice: ethers.parseUnits("30", "gwei") });
    await tx.wait();
    
    let sharesAfter = await pool.lpShares(deployer.address);
    console.log(`Shares after: ${ethers.formatEther(sharesAfter)}`);
    
    const totalShares = await pool.totalLpShares();
    console.log(`Total LP shares: ${ethers.formatEther(totalShares)}`);
}

main().catch(console.error);
