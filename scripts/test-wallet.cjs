const { ethers } = require("ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c"
);

async function main() {
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not set in environment");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);

  console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
