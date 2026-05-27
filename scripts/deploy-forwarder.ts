import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 Deploying TefaGaslessForwarder...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  // Get existing FeeSubsidyPool address from your .env or deployment
  const FEE_SUBSIDY_POOL = process.env.FEE_SUBSIDY_POOL || "0xEcB93d5378985BAe86Bd727dddDB92884519f328";
  
  // Deploy the enhanced forwarder
  const Forwarder = await ethers.getContractFactory("TefaGaslessForwarder");
  const forwarder = await Forwarder.deploy(deployer.address, FEE_SUBSIDY_POOL);
  await forwarder.waitForDeployment();
  
  const forwarderAddr = await forwarder.getAddress();
  console.log(`\n✅ TefaGaslessForwarder deployed at: ${forwarderAddr}`);
  console.log(`   FeeSubsidyPool connected: ${FEE_SUBSIDY_POOL}`);
  
  // Save to .env for relayer
  console.log(`\n📝 Add this to your .env:`);
  console.log(`FORWARDER_ADDR=${forwarderAddr}`);
}

main().catch(console.error);
