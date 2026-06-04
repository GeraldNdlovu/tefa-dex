const { ethers } = require("ethers");

// Sepolia configuration
const SEPOLIA_RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // You need to add your private key

// Contract addresses
const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";

// ERC20 ABI (minimal)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

// Router ABI
const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired) external"
];

async function main() {
  // Check if private key is set
  if (PRIVATE_KEY === "YOUR_PRIVATE_KEY_HERE") {
    console.error("❌ Please edit add-liquidity.js and add your private key");
    console.error("   Get it from: npx hardhat vars get PRIVATE_KEY");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📡 Account: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  const tkaContract = new ethers.Contract(TKA, ERC20_ABI, wallet);
  const tkbContract = new ethers.Contract(TKB, ERC20_ABI, wallet);
  const routerContract = new ethers.Contract(ROUTER, ROUTER_ABI, wallet);

  const amount = ethers.parseEther("10000");
  
  console.log("📝 Approving TKA...");
  let tx = await tkaContract.approve(ROUTER, amount);
  await tx.wait();
  console.log("✅ TKA approved");
  
  console.log("📝 Approving TKB...");
  tx = await tkbContract.approve(ROUTER, amount);
  await tx.wait();
  console.log("✅ TKB approved");
  
  console.log("💧 Adding liquidity...");
  tx = await routerContract.addLiquidity(TKA, TKB, amount, amount);
  await tx.wait();
  console.log("✅ Liquidity added! 10,000 TKA / 10,000 TKB");
}

main().catch(console.error);
