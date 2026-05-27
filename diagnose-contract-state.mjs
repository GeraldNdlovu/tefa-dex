import { ethers } from 'ethers';
import fs from 'fs';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const USER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";
const TOKEN_OUT = "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9";

const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/TefaGaslessExecutor.sol/TefaGaslessExecutor.json", "utf8"));
const executor = new ethers.Contract(EXECUTOR_ADDRESS, artifact.abi, provider);

console.log("=== CONTRACT STATE DIAGNOSIS ===\n");

// 1. Check trusted relayer
const trustedRelayer = await executor.trustedRelayer();
console.log("1. Trusted Relayer:", trustedRelayer);
console.log("   Expected (your wallet):", USER_ADDRESS);
console.log("   Match:", trustedRelayer.toLowerCase() === USER_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO");

// 2. Check nonce
const nonce = await executor.nonces(USER_ADDRESS);
console.log("\n2. Current nonce for user:", nonce.toString());

// 3. Check token balance
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function allowance(address,address) view returns (uint256)", "function decimals() view returns (uint8)"];
const tokenIn = new ethers.Contract(TOKEN_IN, ERC20_ABI, provider);
const tokenOut = new ethers.Contract(TOKEN_OUT, ERC20_ABI, provider);

const balanceIn = await tokenIn.balanceOf(USER_ADDRESS);
const balanceOut = await tokenOut.balanceOf(USER_ADDRESS);
const decimalsIn = await tokenIn.decimals();
const decimalsOut = await tokenOut.decimals();

console.log("\n3. Token Balances:");
console.log(`   TKA (${TOKEN_IN.slice(0,8)}...): ${ethers.formatUnits(balanceIn, decimalsIn)} (${decimalsIn} decimals)`);
console.log(`   TKB (${TOKEN_OUT.slice(0,8)}...): ${ethers.formatUnits(balanceOut, decimalsOut)} (${decimalsOut} decimals)`);

// 4. Check allowance to executor
const allowance = await tokenIn.allowance(USER_ADDRESS, EXECUTOR_ADDRESS);
console.log("\n4. Allowance (TKA -> Executor):", ethers.formatUnits(allowance, decimalsIn));

// 5. Check if executor has required tokens (for fee collection)
const executorBalance = await tokenOut.balanceOf(EXECUTOR_ADDRESS);
console.log("\n5. Executor balance (TKB):", ethers.formatUnits(executorBalance, decimalsOut));

console.log("\n=== RECOMMENDATIONS ===");
if (trustedRelayer.toLowerCase() !== USER_ADDRESS.toLowerCase()) {
  console.log("❌ Executor's trusted relayer is not your wallet. Run: await executor.updateRelayer(USER_ADDRESS) as owner");
}
if (balanceIn < ethers.parseUnits("1", decimalsIn)) {
  console.log("❌ Insufficient TKA balance. Need at least 1 TKA");
}
if (allowance < ethers.parseUnits("1", decimalsIn)) {
  console.log(`❌ Insufficient allowance. Run: await tokenIn.approve(EXECUTOR_ADDRESS, ethers.parseUnits("100", ${decimalsIn}))`);
}
if (nonce > 0) {
  console.log(`ℹ️  Nonce is ${nonce}. Use nonce: ${nonce} in your next signature`);
} else {
  console.log("✅ Nonce is 0. Use nonce: 0 for first swap");
}
