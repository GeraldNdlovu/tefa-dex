import { ethers } from "ethers";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load private key from relayer's .env
const envPath = resolve("relayer/.env");
const envContent = readFileSync(envPath, "utf8");
const privateKeyMatch = envContent.match(/RELAYER_PRIVATE_KEY=([^\n]+)/);
if (!privateKeyMatch) throw new Error("RELAYER_PRIVATE_KEY not found in relayer/.env");
const PRIVATE_KEY = privateKeyMatch[1].trim();

const RPC_URL = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const forwarderAddress = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load compiled Router artifact
const artifactPath = resolve("artifacts/contracts/Router.sol/Router.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));

console.log("Deploying Router with F-01 fixes...");
console.log("Deployer address:", wallet.address);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const router = await factory.deploy(forwarderAddress);
await router.waitForDeployment();

const routerAddress = await router.getAddress();
console.log("\n✅ New Router deployed to:", routerAddress);
console.log("\nUpdate your frontend src/config/contracts.ts with:");
console.log(`  ROUTER: "${routerAddress}",`);
