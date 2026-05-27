import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

// Accept both PRIVATE_KEY and RELAYER_PRIVATE_KEY
const privateKey = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Missing PRIVATE_KEY or RELAYER_PRIVATE_KEY in .env");
if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
  throw new Error("Private key must be 0x + 64 hex chars");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);

const EXECUTOR_ADDRESS = process.env.EXECUTOR_ADDRESS;
if (!EXECUTOR_ADDRESS) throw new Error("Missing EXECUTOR_ADDRESS in .env");

const EXECUTOR_ABI = [
  "function executeSwap((address user,address tokenIn,uint256 amountIn,address tokenOut,uint256 minOut,uint256 relayerFeeAmount,uint256 nonce,uint256 deadline) swap, bytes signature) external",
  "function nonces(address) view returns (uint256)"
];

const executor = new ethers.Contract(EXECUTOR_ADDRESS, EXECUTOR_ABI, wallet);

const worker = new Worker('tefa-gasless', async (job) => {
  const { swap, signature } = job.data;
  console.log(`🔄 Processing job ${job.id} for ${swap.user}`);
  
  // Convert string values to BigInt for execution
  const swapWithBigInt = {
    user: swap.user,
    tokenIn: swap.tokenIn,
    amountIn: BigInt(swap.amountIn),
    tokenOut: swap.tokenOut,
    minOut: BigInt(swap.minOut),
    relayerFeeAmount: BigInt(swap.relayerFeeAmount),
    nonce: BigInt(swap.nonce),
    deadline: BigInt(swap.deadline)
  };
  
  // Pre-simulation
  try {
    await executor.executeSwap.staticCall(swapWithBigInt, signature);
    console.log("✅ Simulation passed");
  } catch (e) {
    throw new Error(`Simulation failed: ${e.message}`);
  }
  
  // Execute
  const tx = await executor.executeSwap(swapWithBigInt, signature, { gasLimit: 300000 });
  console.log(`📡 TX submitted: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
  
  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}, { connection: redis });

worker.on('completed', (job, result) => console.log(`✅ Job ${job.id} completed: ${result.txHash}`));
worker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed: ${err.message}`));

console.log('🚀 Worker started with fixed private key handling');
