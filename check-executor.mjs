import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";

// Try to get the contract interface
const executorCode = await provider.getCode(EXECUTOR_ADDRESS);
console.log("Executor code exists:", executorCode !== "0x");

// Get the contract ABI from artifacts
import fs from 'fs';
const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json", "utf8"));
console.log("\nAvailable functions in ABI:");
artifact.abi.forEach(item => {
  if (item.type === 'function') {
    console.log(`  ${item.name}(${item.inputs.map(i => i.type).join(',')})`);
  }
});
