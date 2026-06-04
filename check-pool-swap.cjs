const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  const pool = new ethers.Contract(POOL, [
    "function swap(address tokenIn, uint256 amountIn) external returns (uint256)"
  ], provider);
  
  // Check if the pool has a fee collector or other constraints
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  console.log("Pool token0:", token0);
  console.log("Pool token1:", token1);
}

main().catch(console.error);
