import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";

// Get the router's interface
const router = new ethers.Contract(ROUTER_ADDRESS, [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)",
  "function swapExactTokensForTokens(uint256, uint256, address[], address, uint256) returns (uint256[])"
], provider);

console.log("Router functions:");
console.log("  swap(address,address,uint256)");
console.log("  swapExactTokensForTokens(uint256,uint256,address[],address,uint256)");

// Check what function the executor expects to call
const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function executeSwap(tuple,address[],bytes) external"
], provider);

// Try to see if the executor's code is on-chain
const code = await provider.getCode(EXECUTOR_ADDRESS);
console.log("\nExecutor code hash:", code.slice(0, 66));

// Decompile the first few bytes to see function signatures
console.log("\nFirst 100 bytes of executor code:", code.slice(0, 200));
