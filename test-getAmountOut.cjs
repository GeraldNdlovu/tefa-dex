const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  
  const router = new ethers.Contract(ROUTER, [
    "function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) view returns (uint256)"
  ], provider);
  
  const amountIn = ethers.parseEther("0.1");
  const expectedOutput = await router.getAmountOut(amountIn, TKB, TKA);
  
  console.log("Amount In: 0.1 TKB");
  console.log("Expected Output:", ethers.formatEther(expectedOutput), "TKA");
  
  // Calculate with 0.3% fee manually
  const amountInNum = 0.1;
  const reserveTKB = 1062.829741162928;
  const reserveTKA = 951.6622842163407;
  const amountInWithFee = amountInNum * 0.997;
  const manualOutput = (amountInWithFee * reserveTKA) / (reserveTKB + amountInWithFee);
  console.log("Manual calculation:", manualOutput.toFixed(6), "TKA");
}

main().catch(console.error);
