import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // You need to add your private key here
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  
  if (!PRIVATE_KEY || PRIVATE_KEY === "0xYOUR_PRIVATE_KEY_HERE") {
    console.error("Please set PRIVATE_KEY environment variable");
    console.error("export PRIVATE_KEY=0xyour_private_key");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  
  const router = new ethers.Contract(ROUTER, [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) returns (uint256)"
  ], wallet);
  
  // Try swapping a small amount (0.1 TKB)
  const amountIn = ethers.parseEther("0.1");
  const amountOutMin = 0; // Zero slippage protection
  
  console.log("Attempting to swap 0.1 TKB to TKA with no minimum output...");
  console.log("Wallet:", wallet.address);
  
  try {
    const tx = await router.swap(TKB, TKA, amountIn, amountOutMin, wallet.address);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.error("❌ Swap failed:", error.message);
    if (error.data) console.error("Revert data:", error.data);
  }
}

main().catch(console.error);
