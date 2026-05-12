const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const address = await deployer.getAddress();
  console.log("Wallet address:", address);
  
  const balance = await hre.ethers.provider.getBalance(address);
  console.log("Sepolia ETH balance:", hre.ethers.formatEther(balance));
  
  if (balance === 0n) {
    console.log("\n❌ No Sepolia ETH!");
    console.log("Get test ETH from:");
    console.log("  - https://sepoliafaucet.com");
    console.log("  - https://faucet.quicknode.com/ethereum/sepolia");
  } else {
    console.log("\n✅ Ready to deploy to Sepolia!");
  }
}

main().catch(console.error);
