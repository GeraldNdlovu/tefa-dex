const hre = require("hardhat");

async function main() {
  console.log("Deploying FeeSubsidyPool...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const FeeSubsidyPool = await hre.ethers.getContractFactory("FeeSubsidyPool");
  const fsp = await FeeSubsidyPool.deploy();
  await fsp.waitForDeployment();
  const fspAddress = await fsp.getAddress();
  
  console.log("\n✅ FeeSubsidyPool DEPLOYED!");
  console.log("Address:", fspAddress);
  
  // Save to file
  const fs = require("fs");
  fs.writeFileSync("fsp-deployed.json", JSON.stringify({ 
    feeSubsidyPool: fspAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  }, null, 2));
  console.log("\n📁 Address saved to: fsp-deployed.json");
  
  // Send initial funds
  console.log("\n💸 Send Sepolia ETH to this address to fund gas reimbursements:");
  console.log(`   ${fspAddress}`);
}

main().catch(console.error);
