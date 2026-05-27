import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet("0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f", provider);
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const USER_ADDRESS = await wallet.getAddress();

// Get current nonce
const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function nonces(address) view returns (uint256)"
], provider);

const currentNonce = await executor.nonces(USER_ADDRESS);
console.log(`📍 Current nonce: ${currentNonce}`);

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

// Use the CORRECT nonce
const swapValues = {
  user: USER_ADDRESS,
  tokenIn: "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155",
  amountIn: ethers.parseEther("0.001"),  // Smaller amount for testing
  tokenOut: "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9",
  minOut: 0,
  relayerFeeAmount: ethers.parseEther("0.00001"),
  nonce: currentNonce,  // Use the fetched nonce!
  deadline: Math.floor(Date.now() / 1000) + 3600
};

console.log(`📝 Swap with nonce: ${swapValues.nonce}`);
console.log(`   TokenIn: ${swapValues.tokenIn}`);
console.log(`   AmountIn: ${ethers.formatEther(swapValues.amountIn)} tokens`);

const signature = await wallet.signTypedData(domain, types, swapValues);
console.log("✅ Signature generated");

const swapForApi = {
  user: swapValues.user,
  tokenIn: swapValues.tokenIn,
  amountIn: swapValues.amountIn.toString(),
  tokenOut: swapValues.tokenOut,
  minOut: swapValues.minOut.toString(),
  relayerFeeAmount: swapValues.relayerFeeAmount.toString(),
  nonce: swapValues.nonce.toString(),
  deadline: swapValues.deadline.toString()
};

const response = await fetch('http://localhost:3001/api/gasless/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: USER_ADDRESS,
    swap: swapForApi,
    path: [swapValues.tokenIn, swapValues.tokenOut],
    signature: signature
  })
});

const result = await response.json();
console.log("\n📋 Relayer Response:", result);

if (result.status === 'queued') {
  console.log(`\n✅ Swap queued! Job ID: ${result.jobId}`);
  console.log("\n📊 Check worker logs:");
  console.log("   pm2 logs tefa-worker --lines 20");
}
