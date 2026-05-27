import fs from 'fs';

// Read the actual executor contract source
try {
  const source = fs.readFileSync("contracts/TefaGaslessExecutor.sol", "utf8");
  console.log("=== EXECUTOR SOURCE CODE ===\n");
  
  // Find the executeSwap function
  const startIdx = source.indexOf("function executeSwap");
  const endIdx = source.indexOf("}", startIdx);
  const executeSwapCode = source.substring(startIdx, endIdx + 1);
  console.log(executeSwapCode);
  
  // Also check what router function it's calling
  const routerCallMatch = source.match(/router\.([a-zA-Z0-9_]+)\(/);
  if (routerCallMatch) {
    console.log("\n=== ROUTER CALL ===");
    console.log(`The executor calls: router.${routerCallMatch[1]}()`);
  }
} catch (e) {
  console.log("Could not read source:", e.message);
}
