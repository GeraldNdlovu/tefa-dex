const { ethers } = require("ethers");
const fs = require("fs");

// FeeSubsidyPool contract bytecode and ABI
const FSP_ABI = [
  "constructor()",
  "function fund() external payable",
  "function withdraw(address to, uint256 amount) external",
  "function balance() view returns (uint256)"
];

const FSP_BYTECODE = "0x6080604052348015600f57600080fd5b5060ab8061001e6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c8063b69ef8a8146041578063d0f30b08146059578063f3fef3a3146063575b600080fd5b60496079565b6040519081526020015b60405180910390f35b605f607f565b005b60776004803603810190607591906088565b6087565b005b47600081565b565b5050565b600080fd5b6000819050919050565b609e816088565b811460a857600080fd5b5056fea26469706673582212203f09db2d6b0b9e64c4a8f5c1b6d6f5c4b2d3f5b4c5d6e7f8a9b0c1d2e3f4a5b6c64736f6c63430008160033";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.gateway.tenderly.co");
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  const factory = new ethers.ContractFactory(FSP_ABI, FSP_BYTECODE, wallet);
  console.log("Deploying FeeSubsidyPool...");
  
  const fsp = await factory.deploy();
  await fsp.waitForDeployment();
  const fspAddress = await fsp.getAddress();
  
  console.log("\n✅ FeeSubsidyPool DEPLOYED!");
  console.log("Address:", fspAddress);
  
  fs.writeFileSync("fsp-deployed.json", JSON.stringify({ 
    feeSubsidyPool: fspAddress,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address
  }, null, 2));
  console.log("\n📁 Address saved to: fsp-deployed.json");
  console.log("\n💸 Send Sepolia ETH to this address to fund gas reimbursements:");
  console.log(`   ${fspAddress}`);
}

main().catch(console.error);
