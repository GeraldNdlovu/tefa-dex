const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const PRIVATE_KEY = "0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f";
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  
  const tkb = new ethers.Contract(TKB, [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)"
  ], provider);
  
  const balance = await tkb.balanceOf(wallet.address);
  console.log("Your TKB Balance:", ethers.formatEther(balance));
  
  const allowance = await tkb.allowance(wallet.address, ROUTER);
  console.log("Router Allowance:", ethers.formatEther(allowance));
  
  // Check pool reserves
  const pool = new ethers.Contract(POOL, [
    "function getReserves() view returns (uint256, uint256)",
    "function token0() view returns (address)"
  ], provider);
  
  const reserves = await pool.getReserves();
  const token0 = await pool.token0();
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  
  let reserve0 = ethers.formatEther(reserves[0]);
  let reserve1 = ethers.formatEther(reserves[1]);
  
  console.log("Pool Reserves:");
  if (token0.toLowerCase() === TKA.toLowerCase()) {
    console.log("  TKA:", reserve0);
    console.log("  TKB:", reserve1);
  } else {
    console.log("  TKB:", reserve0);
    console.log("  TKA:", reserve1);
  }
  
  // Check if pool is registered with router
  const router = new ethers.Contract(ROUTER, [
    "function getPool(address, address) view returns (address)"
  ], provider);
  
  const poolFromRouter = await router.getPool(TKB, TKA);
  console.log("\nPool from router:", poolFromRouter);
  console.log("Expected pool:", POOL);
  console.log("Match:", poolFromRouter.toLowerCase() === POOL.toLowerCase());
}

main().catch(console.error);
