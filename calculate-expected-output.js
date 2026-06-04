import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
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
    reserveTKA = reserves[0];
    reserveTKB = reserves[1];
  } else {
    reserveTKA = reserves[1];
    reserveTKB = reserves[0];
  }
  
  console.log("Reserve TKA:", ethers.formatEther(reserveTKA));
  console.log("Reserve TKB:", ethers.formatEther(reserveTKB));
  
  // Calculate expected output for swapping 1 TKB
  const amountIn = ethers.parseEther("1");
  const amountInNum = parseFloat(ethers.formatEther(amountIn));
  const reserveTKBNum = parseFloat(ethers.formatEther(reserveTKB));
  const reserveTKANum = parseFloat(ethers.formatEther(reserveTKA));
  
  // With 0.3% fee
  const amountInWithFee = amountInNum * 0.997;
  const expectedOutput = (amountInWithFee * reserveTKANum) / (reserveTKBNum + amountInWithFee);
  
  console.log("\nFor swapping 1 TKB:");
  console.log("Expected output (with 0.3% fee):", expectedOutput.toFixed(6), "TKA");
  console.log("That's about", (1/expectedOutput).toFixed(2), "TKB per TKA");
}

main().catch(console.error);
