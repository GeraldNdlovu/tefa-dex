const { ethers } = require("ethers");
const fs = require("fs");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const forwarderArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/TrustedForwarder.sol/TrustedForwarder.json", "utf8"));

async function main() {
  console.log("Deployer:", wallet.address);
  console.log("Deploying TrustedForwarder...");
  
  const factory = new ethers.ContractFactory(forwarderArtifact.abi, forwarderArtifact.bytecode, wallet);
  const forwarder = await factory.deploy();
  await forwarder.waitForDeployment();
  const addr = await forwarder.getAddress();
  
  console.log("✅ Forwarder deployed at:", addr);
}

main().catch(console.error);
