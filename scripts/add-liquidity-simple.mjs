import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const tokenA = await ethers.getContractAt("MockERC20", TKA);
  const tokenB = await ethers.getContractAt("MockERC20", TKB);
  const router = await ethers.getContractAt("Router", ROUTER);
  
  console.log("=== ADD LIQUIDITY ===\n");
  
  // Current allowances
  const allowanceA = await tokenA.allowance(wallet, ROUTER);
  const allowanceB = await tokenB.allowance(wallet, ROUTER);
  console.log(`Current allowances - TKA: ${ethers.formatEther(allowanceA)}, TKB: ${ethers.formatEther(allowanceB)}`);
  
  const amount = ethers.parseEther("500");
  
  // Only approve if needed
  if (allowanceA < amount) {
    console.log("Approving TKA...");
    const approveA = await tokenA.approve(ROUTER, amount);
    await approveA.wait();
    console.log("✅ TKA approved");
  }
  
  if (allowanceB < amount) {
    console.log("Approving TKB...");
    const approveB = await tokenB.approve(ROUTER, amount);
    await approveB.wait();
    console.log("✅ TKB approved");
  }
  
  // Check and create pool if needed
  let poolAddr = await router.getPool(TKA, TKB);
  if (poolAddr === "0x0000000000000000000000000000000000000000") {
    console.log("\nCreating pool...");
    const tx = await router.createPool(TKA, TKB);
    await tx.wait();
    poolAddr = await router.getPool(TKA, TKB);
    console.log(`✅ Pool created: ${poolAddr}`);
  } else {
    console.log(`\n✅ Pool exists: ${poolAddr}`);
  }
  
  // Add liquidity
  console.log(`\nAdding ${ethers.formatEther(amount)} TKA + ${ethers.formatEther(amount)} TKB...`);
  const addTx = await router.addLiquidity(TKA, TKB, amount, amount);
  await addTx.wait();
  console.log("✅ Liquidity added!");
  
  // Verify
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const shares = await pool.lpShares(wallet);
  console.log(`\nYour LP shares: ${ethers.formatEther(shares)}`);
  console.log(`Reserves: TKA ${ethers.formatEther(await pool.reserve0())}, TKB ${ethers.formatEther(await pool.reserve1())}`);
}

main().catch(console.error);
