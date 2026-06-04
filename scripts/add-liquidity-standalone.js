const { ethers } = require("ethers");

// Configuration - UPDATE THESE
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Set this in .env
const TOKEN_A = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
const TOKEN_B = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired) external returns (uint256, uint256, uint256)"
];

async function main() {
  if (!PRIVATE_KEY || PRIVATE_KEY === "0xYOUR_PRIVATE_KEY") {
    throw new Error("Set PRIVATE_KEY in .env file");
  }

  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("=== Adding Liquidity to TEFA DEX ===\n");
  console.log(`Wallet: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  const tokenA = new ethers.Contract(TOKEN_A, ERC20_ABI, wallet);
  const tokenB = new ethers.Contract(TOKEN_B, ERC20_ABI, wallet);
  const router = new ethers.Contract(ROUTER, ROUTER_ABI, wallet);
  
  const amount = ethers.parseEther("10000");
  
  console.log("1. Approving Router to spend TKA...");
  let tx = await tokenA.approve(ROUTER, amount);
  await tx.wait();
  console.log("   ✅ TKA approved\n");
  
  console.log("2. Approving Router to spend TKB...");
  tx = await tokenB.approve(ROUTER, amount);
  await tx.wait();
  console.log("   ✅ TKB approved\n");
  
  console.log("3. Adding 10,000 TKA + 10,000 TKB to pool...");
  tx = await router.addLiquidity(TOKEN_A, TOKEN_B, amount, amount);
  const receipt = await tx.wait();
  console.log("   ✅ Liquidity added successfully!\n");
  
  console.log("=== Done ===");
  console.log("Pool now has 10,000 TKA and 10,000 TKB reserves");
  console.log("Swaps will now work on the frontend");
}

main().catch(console.error);
