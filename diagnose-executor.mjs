import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet("0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f", provider);
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
const USER_ADDRESS = await wallet.getAddress();
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";
const TOKEN_OUT = "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9";

console.log("=== EXECUTOR DIAGNOSIS ===\n");

// Check executor code
const code = await provider.getCode(EXECUTOR_ADDRESS);
console.log("1. Executor deployed:", code !== "0x" ? "✅ YES" : "❌ NO");

// Check router
const routerCode = await provider.getCode(ROUTER_ADDRESS);
console.log("2. Router deployed:", routerCode !== "0x" ? "✅ YES" : "❌ NO");

// Check executor ABI
const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function router() view returns (address)",
  "function trustedRelayer() view returns (address)",
  "function nonces(address) view returns (uint256)"
], provider);

try {
  const router = await executor.router();
  console.log("3. Router in executor:", router);
  console.log("   Expected:", ROUTER_ADDRESS);
  console.log("   Match:", router.toLowerCase() === ROUTER_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO");
} catch (e) {
  console.log("3. Could not get router:", e.message);
}

const trustedRelayer = await executor.trustedRelayer();
console.log("4. Trusted relayer:", trustedRelayer);
console.log("   Current wallet:", USER_ADDRESS);
console.log("   Match:", trustedRelayer.toLowerCase() === USER_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO");

const nonce = await executor.nonces(USER_ADDRESS);
console.log("5. Current nonce:", nonce.toString());

// Check if executor can swap directly
const EXECUTOR_ABI = [
  "function executeSwap((address user,address tokenIn,uint256 amountIn,address tokenOut,uint256 minOut,uint256 relayerFeeAmount,uint256 nonce,uint256 deadline) swap, address[] path, bytes signature) external returns (uint256)"
];

const executorWithAbi = new ethers.Contract(EXECUTOR_ADDRESS, EXECUTOR_ABI, wallet);

// Build a test swap
const testSwap = {
  user: USER_ADDRESS,
  tokenIn: TOKEN_IN,
  amountIn: ethers.parseEther("0.001"),
  tokenOut: TOKEN_OUT,
  minOut: 0,
  relayerFeeAmount: 0,
  nonce: nonce,
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
console.log("\n6. Test signature generated");

try {
  const path = [TOKEN_IN, TOKEN_OUT];
  const result = await executorWithAbi.executeSwap.staticCall(testSwap, path, signature);
  console.log("✅ Test swap simulation passed! Output:", ethers.formatEther(result));
} catch (e) {
  console.log("❌ Test swap failed:", e.message);
  if (e.revert) console.log("   Revert reason:", e.revert);
}
