import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Sepolia ETH balance:", ethers.formatEther(balance));
  
  if (balance === 0n) {
    console.log("\n❌ No Sepolia ETH!");
    console.log("Get test ETH from:");
    console.log("  - https://sepoliafaucet.com");
    console.log("  - https://faucet.quicknode.com/ethereum/sepolia");
    console.log("  - https://www.alchemy.com/faucets/ethereum-sepolia");
  } else {
    console.log("\n✅ Ready to deploy to Sepolia!");
  }
}

main().catch(console.error);
