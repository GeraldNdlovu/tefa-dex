const { ethers } = require("ethers");
const fs = require("fs");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const routerArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/Router.sol/Router.json", "utf8"));

async function main() {
  const forwarder = "0x156eAdE98182972A15F8eb86546226E0341355b1";

  console.log("Deploying Router with forwarder:", forwarder);
  console.log("Deployer:", wallet.address);

  const factory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
  const router = await factory.deploy(forwarder);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  
  console.log("✅ Router deployed at:", routerAddr);
}

main().catch(console.error);
