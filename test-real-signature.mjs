import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet("0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f", provider);
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";

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

const swapValues = {
  user: await wallet.getAddress(),
  tokenIn: "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155",
  amountIn: ethers.parseEther("1"),
  tokenOut: "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9",
  minOut: 0,
  relayerFeeAmount: 0,
  nonce: 1,
  deadline: Math.floor(Date.now() / 1000) + 3600
};

const signature = await wallet.signTypedData(domain, types, swapValues);
console.log("✅ Real signature generated:", signature);

// Convert BigInt to string for JSON
const swapForJson = {
  user: swapValues.user,
  tokenIn: swapValues.tokenIn,
  amountIn: swapValues.amountIn.toString(),
  tokenOut: swapValues.tokenOut,
  minOut: swapValues.minOut.toString(),
  relayerFeeAmount: swapValues.relayerFeeAmount.toString(),
  nonce: swapValues.nonce.toString(),
  deadline: swapValues.deadline.toString()
};

const requestBody = {
  user: swapValues.user,
  swap: swapForJson,
  signature: signature
};

console.log("\n📋 Submitting to relayer...");
const response = await fetch('http://localhost:3001/api/gasless/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody)
});
const result = await response.json();
console.log("Relayer response:", result);
