import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // You need to add your private key here to sign the transaction
  const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xYOUR_PRIVATE_KEY_HERE";
  
  if (PRIVATE_KEY === "0xYOUR_PRIVATE_KEY_HERE") {
    console.error("Please set your PRIVATE_KEY environment variable");
    console.error("Run: export PRIVATE_KEY=0xyour_private_key");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  const router = new ethers.Contract(ROUTER, [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) returns (uint256)"
  ], wallet);
  
  const amountIn = ethers.parseEther("10"); // Swap 10 TKB to TKA
  
  console.log("Swapping 10 TKB to TKA...");
  console.log("From:", wallet.address);
  console.log("Router:", ROUTER);
  
  try {
    const tx = await router.swap(TKB, TKA, amountIn, 0, wallet.address);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Swap successful!");
  } catch (error) {
    console.error("Swap failed:", error.message);
    if (error.data) console.error("Revert reason:", error.data);
  }
}

main().catch(console.error);
