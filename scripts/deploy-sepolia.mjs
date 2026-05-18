import hre from "hardhat";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("Deploying TEFA DEX to Sepolia...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

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

  const addresses = {
    router: await router.getAddress(),
    forwarder: await forwarder.getAddress(),
    tokenA: await tokenA.getAddress(),
    tokenB: await tokenB.getAddress(),
    pool: poolAddress
  };
  fs.writeFileSync("deployed-sepolia.json", JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment complete! Addresses saved to deployed-sepolia.json");
  console.log("\n🔐 For Forta monitoring, add these to .env:");
  console.log(`ROUTER_ADDRESS=${addresses.router}`);
  console.log(`POOL_ADDRESSES=${addresses.pool}`);
}

main().catch(console.error);
