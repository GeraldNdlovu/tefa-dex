import hre from "hardhat";

async function main() {
  console.log("Available properties:", Object.keys(hre));
  console.log("hre.ethers:", typeof hre.ethers);
  console.log("hre.network:", typeof hre.network);
  
  // Try getting provider directly
  const provider = hre.network.provider;
  console.log("Provider exists:", !!provider);
  
  if (provider) {
    const block = await provider.send("eth_blockNumber", []);
    console.log("Current block:", block);
  }
}

main().catch(console.error);
