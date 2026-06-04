import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // Get signer from the first account in the hardhat config
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  console.log("Deploying Router with F-01 fixes...");
  console.log("Deployer:", deployer.address);
  
  const forwarderAddress = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddress);
  await router.waitForDeployment();
  
  const routerAddress = await router.getAddress();
  console.log("✅ New Router deployed to:", routerAddress);
  console.log("");
  console.log("Update your frontend config with this address:", routerAddress);
  console.log("Test swap with slippage and deadline parameters.");
}

main().catch(console.error);
