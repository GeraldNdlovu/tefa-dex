const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  const pool = new ethers.Contract(POOL, [
    "function getReserves() view returns (uint256, uint256)",
    "function token0() view returns (address)"
  ], provider);
  
  const reserves = await pool.getReserves();
  const token0 = await pool.token0();
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  
  let reserveTKA, reserveTKB;
  if (token0.toLowerCase() === TKA.toLowerCase()) {
    reserveTKA = parseFloat(ethers.utils.formatEther(reserves[0]));
    reserveTKB = parseFloat(ethers.utils.formatEther(reserves[1]));
  } else {
    reserveTKA = parseFloat(ethers.utils.formatEther(reserves[1]));
    reserveTKB = parseFloat(ethers.utils.formatEther(reserves[0]));
  }
  
  console.log("Current Reserves:");
  console.log("  TKA:", reserveTKA);
  console.log("  TKB:", reserveTKB);
  
  // Test with 0.5 TKB
  const amountIn = 0.5;
  const amountInWithFee = amountIn * 0.997;
  const amountOut = (amountInWithFee * reserveTKA) / (reserveTKB + amountInWithFee);
  
  console.log("\nSwapping 0.5 TKB:");
  console.log("  Expected output:", amountOut.toFixed(6), "TKA");
  console.log("  Min output (1% slippage):", (amountOut * 0.99).toFixed(6), "TKA");
  
  console.log("\nPlease try swapping 0.5 TKB in the frontend instead of 11 TKB");
}

main().catch(console.error);
