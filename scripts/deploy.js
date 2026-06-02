import hre from "hardhat";

async function main() {
  console.log("Deploying TEFA DEX...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Forwarder = await hre.ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  console.log("TrustedForwarder:", await forwarder.getAddress());

  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(await forwarder.getAddress());
  await router.waitForDeployment();
  console.log("Router:", await router.getAddress());

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const tokenA = await MockERC20.deploy("Token A", "TKNA", 18);
  await tokenA.waitForDeployment();
  const tokenB = await MockERC20.deploy("Token B", "TKNB", 18);
  await tokenB.waitForDeployment();
  console.log("TokenA:", await tokenA.getAddress());
  console.log("TokenB:", await tokenB.getAddress());

  await router.createPool(await tokenA.getAddress(), await tokenB.getAddress());
  const poolAddress = await router.getPool(await tokenA.getAddress(), await tokenB.getAddress());
  console.log("Pool:", poolAddress);

  console.log("\n✅ Deployment Complete!");
}

main().catch(console.error);
