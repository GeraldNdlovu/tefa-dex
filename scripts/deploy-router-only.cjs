async function main() {
  const hre = await import("hardhat");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Router with F-01 fixes...");
  console.log("Deployer:", deployer.address);
  
  const forwarderAddress = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddress);
  await router.waitForDeployment();
  
  console.log("✅ New Router deployed to:", await router.getAddress());
  console.log("");
  console.log("Update your frontend config with this address.");
  console.log("Test swap with slippage and deadline parameters.");
}

main().catch(console.error);
