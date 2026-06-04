import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  const pool = new ethers.Contract(POOL, [
    "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) pure returns (uint256)"
  ], provider);
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  
  const reserves = {
    TKB: 1062.829741162928082609,
    TKA: 951.662284216340705691
  };
  
  const amountIn = 11; // 11 TKB
  const reserveIn = reserves.TKB;
  const reserveOut = reserves.TKA;
  
  // Calculate using x*y=k with 0.3% fee
  const amountInWithFee = amountIn * 0.997;
  const amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
  
  console.log("Manual calculation:");
  console.log("  Amount In (TKB):", amountIn);
  console.log("  Reserve In (TKB):", reserveIn);
  console.log("  Reserve Out (TKA):", reserveOut);
  console.log("  Expected output (TKA):", amountOut.toFixed(6));
  console.log("");
  console.log("Recommendation: Try swapping a smaller amount like 0.5 TKB first");
}

main().catch(console.error);
