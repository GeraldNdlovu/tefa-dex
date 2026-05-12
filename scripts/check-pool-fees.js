import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const poolAddr = "0x212fdfCfCC22db97DeB3AC3260414909282BB4EE";
  const feeCollectorAddr = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  const routerAddr = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";
  const tokenAAddr = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";
  const tokenBAddr = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
  
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const feeCollector = await ethers.getContractAt("FeeCollector", feeCollectorAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log("Pool Reserves:", ethers.formatEther(reserve0), "TKA /", ethers.formatEther(reserve1), "TKB");
  
  const accumulatedFees = await feeCollector.getAccumulatedFees(poolAddr);
  console.log("Accumulated fees in FeeCollector from this pool:", ethers.formatEther(accumulatedFees));
  
  const totalCollected = await feeCollector.totalFeesCollected(poolAddr);
  console.log("Total fees collected from this pool:", ethers.formatEther(totalCollected));
  
  // Check if fee collector has POOL_ROLE for this pool
  const POOL_ROLE = await feeCollector.POOL_ROLE();
  const hasRole = await feeCollector.hasRole(POOL_ROLE, poolAddr);
  console.log("Pool has POOL_ROLE:", hasRole);
  
  // Do a small test swap
  console.log("\n--- Performing test swap ---");
  const router = await ethers.getContractAt("Router", routerAddr);
  const amountIn = ethers.parseEther("1");
  
  const balanceBefore = await tokenA.balanceOf(deployer.address);
  console.log("TKA balance before:", ethers.formatEther(balanceBefore));
  
  // Approve
  await tokenA.approve(routerAddr, amountIn);
  
  // Swap
  const tx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
  await tx.wait();
  
  const balanceAfter = await tokenA.balanceOf(deployer.address);
  console.log("TKA balance after:", ethers.formatEther(balanceAfter));
  
  // Check updated accumulated fees
  const newAccumulated = await feeCollector.getAccumulatedFees(poolAddr);
  console.log("\nAccumulated fees after swap:", ethers.formatEther(newAccumulated));
  
  // Check Treasury and FSP balances
  const treasuryAddr = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
  const fspAddr = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
  console.log("\nTreasury balance:", ethers.formatEther(await ethers.provider.getBalance(treasuryAddr)));
  console.log("FSP balance:", ethers.formatEther(await ethers.provider.getBalance(fspAddr)));
}

main().catch(console.error);
