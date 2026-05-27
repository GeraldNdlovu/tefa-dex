import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet("0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f", provider);
const ROUTER_ADDRESS = "0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca";
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";
const TOKEN_OUT = "0xa2a5CF99ae48dfAF190186f734142C6D17E887B9";

// Check pool exists for these tokens
const router = new ethers.Contract(ROUTER_ADDRESS, [
  "function getPool(address tokenA, address tokenB) view returns (address)",
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)"
], wallet);

const pool = await router.getPool(TOKEN_IN, TOKEN_OUT);
console.log("Pool address:", pool);

if (pool === "0x0000000000000000000000000000000000000000") {
  console.log("❌ No pool exists for TKA/TKB pair!");
  process.exit(1);
}

// Check pool reserves
const poolContract = new ethers.Contract(pool, [
  "function reserve0() view returns (uint256)",
  "function reserve1() view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
], provider);

const token0 = await poolContract.token0();
const token1 = await poolContract.token1();
const reserve0 = await poolContract.reserve0();
const reserve1 = await poolContract.reserve1();

console.log("\nPool info:");
console.log("  token0:", token0);
console.log("  token1:", token1);
console.log("  reserve0:", ethers.formatEther(reserve0));
console.log("  reserve1:", ethers.formatEther(reserve1));

// Check token approvals
const token = new ethers.Contract(TOKEN_IN, [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
], wallet);

const allowance = await token.allowance(await wallet.getAddress(), ROUTER_ADDRESS);
console.log("\nAllowance to Router:", ethers.formatEther(allowance));

if (allowance < ethers.parseEther("0.01")) {
  console.log("\n⚠️ Low allowance. Approving router...");
  const tx = await token.approve(ROUTER_ADDRESS, ethers.parseEther("1000"));
  await tx.wait();
  console.log("✅ Approved");
}

// Try direct swap
const swapAmount = ethers.parseEther("0.001");
console.log(`\nAttempting direct swap of ${ethers.formatEther(swapAmount)} TKA -> TKB...`);

try {
  const tx = await router.swap(TOKEN_IN, TOKEN_OUT, swapAmount);
  console.log("Tx submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Swap confirmed in block", receipt.blockNumber);
} catch (e) {
  console.log("❌ Swap failed:", e.message);
  if (e.revert) console.log("Revert reason:", e.revert);
}
