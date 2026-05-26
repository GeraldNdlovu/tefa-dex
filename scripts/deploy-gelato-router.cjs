const hre = require("hardhat");

async function main() {
  const GELATO_RELAY_ADDRESS = "0xb82e63585e53c47ee83104f22c21ab1fe76f2eae";
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying Router with Gelato forwarder...");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Gelato Relay Address: ${GELATO_RELAY_ADDRESS}`);
  
  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(GELATO_RELAY_ADDRESS);
  await router.waitForDeployment();
  
  const routerAddress = await router.getAddress();
  console.log(`\n✅ New Router deployed: ${routerAddress}`);
  console.log(`   This Router accepts Gelato as trusted forwarder`);
  
  // Save address
  const fs = require("fs");
  fs.writeFileSync("gelato-router-address.json", JSON.stringify({
    router: routerAddress,
    gelatoForwarder: GELATO_RELAY_ADDRESS,
    deployedAt: new Date().toISOString()
  }, null, 2));
  
  console.log("\n📋 Update your frontend config with:");
  console.log(`   ROUTER: "${routerAddress}"`);
}

main().catch(console.error);
