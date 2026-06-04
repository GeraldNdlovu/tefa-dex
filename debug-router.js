import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const POOL = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  
  // Check if router has the pool registered
  const router = new ethers.Contract(ROUTER, [
    "function getPool(address, address) view returns (address)",
    "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) returns (uint256)"
  ], provider);
  
  const poolFromRouter = await router.getPool(TKA, TKB);
  console.log("Pool from router:", poolFromRouter);
  console.log("Expected pool:", POOL);
  console.log("Match:", poolFromRouter.toLowerCase() === POOL.toLowerCase());
  
  // Check if the swap function exists
  const code = await provider.getCode(ROUTER);
  console.log("Router has code:", code.length > 2);
  
  // Try to get the swap function signature
  const swapData = router.interface.encodeFunctionData("swap", [TKB, TKA, ethers.parseEther("1"), 0, "0x0000000000000000000000000000000000000000"]);
  console.log("Swap function data prefix:", swapData.slice(0, 10));
}

main().catch(console.error);
