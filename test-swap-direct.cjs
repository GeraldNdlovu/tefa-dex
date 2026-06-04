const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // You need to add your private key here to sign
  const PRIVATE_KEY = "0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f";
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  
  const router = new ethers.Contract(ROUTER, [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256)"
  ], wallet);
  
  // Try swapping 0.1 TKB
  const amountIn = ethers.parseEther("0.1");
  const amountOutMin = 0;
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  
  console.log("Swapping 0.1 TKB to TKA...");
  console.log("Amount In:", ethers.formatEther(amountIn), "TKB");
  console.log("Deadline:", deadline);
  
  try {
    const tx = await router.swap(TKB, TKA, amountIn, amountOutMin, deadline);
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Swap successful!");
  } catch (error) {
    console.error("Swap failed:", error.message);
    if (error.data) console.error("Revert data:", error.data);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main().catch(console.error);
