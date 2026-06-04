const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  const router = new ethers.Contract(ROUTER, [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) returns (uint256)",
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256)"
  ], provider);
  
  // Check if the router has a deadline or to parameter
  console.log("Checking router interface...");
  
  // Try to get the function signatures
  const iface = router.interface;
  console.log("Available functions:");
  for (const fragment of Object.values(iface.fragments)) {
    if (fragment.type === "function") {
      console.log(`  ${fragment.format()}`);
    }
  }
}

main().catch(console.error);
