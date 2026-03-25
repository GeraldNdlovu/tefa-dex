	import { HardhatRuntimeEnvironment } from "hardhat/types/runtime.js";
import { ethers } from "ethers";

// Get the Hardhat Runtime Environment
const hre = await import("hardhat");

async function main() {
  const poolAddr = "0x6F1216D1BFe15c98520CA1434FC1d9D57AC95321";
  
  const pool = await hre.ethers.getContractAt("Pool", poolAddr);
  
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  
  console.log("Reserve0:", hre.ethers.formatEther(reserve0));
  console.log("Reserve1:", hre.ethers.formatEther(reserve1));
  
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  console.log("Token0 address:", token0);
  console.log("Token1 address:", token1);
}

main().catch(console.error);

