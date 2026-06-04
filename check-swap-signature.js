import { ethers } from "ethers";

async function main() {
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const router = new ethers.Contract(ROUTER, [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) external returns (uint256)",
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory)"
  ], provider);
  
  // Get the interface to see the function signature
  const swapSignature = router.interface.getFunction("swap");
  console.log("Expected swap function:", swapSignature.format());
}

main().catch(console.error);
