import { ethers } from 'ethers';
import fs from 'fs';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";

// Get the contract creation code (first few bytes to identify)
const code = await provider.getCode(EXECUTOR_ADDRESS);
console.log("Executor code length:", code.length);

// Try to read the actual contract source
console.log("\nAttempting to read contract ABI from artifacts...");
try {
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json", "utf8"));
  console.log("\nAvailable functions:");
  artifact.abi.filter(item => item.type === 'function').forEach(f => {
    console.log(`  ${f.name}(${f.inputs.map(i => i.type).join(',')}) -> ${f.outputs?.[0]?.type || 'void'}`);
  });
  
  // Check if there's a debug event we can listen to
  const iface = new ethers.Interface(artifact.abi);
  console.log("\n🔍 The executor's executeSwap function expects:", iface.getFunction("executeSwap"));
} catch (e) {
  console.log("Could not read artifact:", e.message);
}

// Check if the router has the expected swap function
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
const router = new ethers.Contract(ROUTER_ADDRESS, [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256)"
], provider);

try {
  const routerCode = router.interface.getFunction("swap");
  console.log("\n✅ Router swap function:", routerCode.format());
} catch (e) {
  console.log("\n❌ Router swap function not found:", e.message);
}
