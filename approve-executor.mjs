import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config({ path: 'relayer/.env' });

const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const EXECUTOR_ADDRESS = "0xfA6e245B353934c6D9980b285F3660694764384c";
const TKA_ADDRESS = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";

console.log("=== APPROVING EXECUTOR ===\n");
console.log("Executor:", EXECUTOR_ADDRESS);
console.log("Token:", TKA_ADDRESS);
console.log("Wallet:", wallet.address);

const token = new ethers.Contract(TKA_ADDRESS, [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
], wallet);

// Check current allowance
const currentAllowance = await token.allowance(wallet.address, EXECUTOR_ADDRESS);
const balance = await token.balanceOf(wallet.address);

console.log("\nCurrent allowance:", ethers.formatEther(currentAllowance), "TKA");
console.log("Your balance:", ethers.formatEther(balance), "TKA");

if (currentAllowance >= ethers.parseEther("1")) {
  console.log("\n✅ Allowance already sufficient!");
} else {
  console.log("\n📝 Approving executor to spend 1000 TKA...");
  const tx = await token.approve(EXECUTOR_ADDRESS, ethers.parseEther("1000"));
  console.log("TX submitted:", tx.hash);
  await tx.wait();
  console.log("✅ Approval confirmed!");
}

// Verify new allowance
const newAllowance = await token.allowance(wallet.address, EXECUTOR_ADDRESS);
console.log("\nNew allowance:", ethers.formatEther(newAllowance), "TKA");
