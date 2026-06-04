const { ethers } = require("ethers");
const fs = require("fs");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const tokenArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/MockERC20.sol/MockERC20.json", "utf8"));

async function main() {
  console.log("Deploying TKA token...");
  const factory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, wallet);
  const tka = await factory.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  await tka.waitForDeployment();
  const tkaAddr = await tka.getAddress();
  console.log("✅ TKA deployed at:", tkaAddr);
  
  console.log("\nDeploying TKB token...");
  const tkb = await factory.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tkb.waitForDeployment();
  const tkbAddr = await tkb.getAddress();
  console.log("✅ TKB deployed at:", tkbAddr);
  
  console.log("\n✅ Both tokens deployed successfully");
  console.log("TKA:", tkaAddr);
  console.log("TKB:", tkbAddr);
}

main().catch(console.error);
