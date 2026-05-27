import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet("0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f", provider);
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
const USER_ADDRESS = await wallet.getAddress();
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";
const TOKEN_OUT = "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9";

// Get the router's swap function signature
const router = new ethers.Contract(ROUTER_ADDRESS, [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)"
], provider);

// Encode the swap call that the executor will make
const swapAmount = ethers.parseEther("0.001");
const swapCalldata = router.interface.encodeFunctionData("swap", [TOKEN_IN, TOKEN_OUT, swapAmount]);
console.log("Router swap calldata:", swapCalldata);
console.log("Expected calldata length:", swapCalldata.length);

// Check if executor has the router address correct
const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function router() view returns (address)"
], provider);
const executorRouter = await executor.router();
console.log("\nExecutor's router address:", executorRouter);
console.log("Expected router address:", ROUTER_ADDRESS);
console.log("Match:", executorRouter.toLowerCase() === ROUTER_ADDRESS.toLowerCase() ? "✅" : "❌");

// Build a complete test call
const testSwap = {
  user: USER_ADDRESS,
  tokenIn: TOKEN_IN,
  amountIn: ethers.parseEther("0.001"),
  tokenOut: TOKEN_OUT,
  minOut: 0,
  relayerFeeAmount: 0,
  nonce: 0,
  deadline: Math.floor(Date.now() / 1000) + 3600
};

const domain = {
  name: 'TefaGaslessExecutor',
  version: '1',
  chainId: 11155111,
  verifyingContract: EXECUTOR_ADDRESS
};

const types = {
  Swap: [
    { name: 'user', type: 'address' },
    { name: 'tokenIn', type: 'address' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'tokenOut', type: 'address' },
    { name: 'minOut', type: 'uint256' },
    { name: 'relayerFeeAmount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

const signature = await wallet.signTypedData(domain, types, testSwap);
console.log("\nSignature generated");

const executorABI = [
  "function executeSwap((address user,address tokenIn,uint256 amountIn,address tokenOut,uint256 minOut,uint256 relayerFeeAmount,uint256 nonce,uint256 deadline) swap, address[] path, bytes signature) external"
];

const executorWithAbi = new ethers.Contract(EXECUTOR_ADDRESS, executorABI, wallet);
const path = [TOKEN_IN, TOKEN_OUT];

console.log("\nAttempting static call with exact parameters...");
try {
  const result = await executorWithAbi.executeSwap.staticCall(testSwap, path, signature);
  console.log("✅ SUCCESS! Result:", result);
} catch (e) {
  console.log("❌ Failed:", e.message);
  console.log("Revert data:", e.data || "none");
  
  // Try to decode revert reason
  if (e.data) {
    try {
      const iface = new ethers.Interface(["function Error(string)"]);
      const decoded = iface.decodeFunctionData("Error", e.data);
      console.log("Decoded revert reason:", decoded);
    } catch (decodeErr) {
      console.log("Could not decode revert data");
    }
  }
}
