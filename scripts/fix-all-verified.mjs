import { ethers } from "ethers";
import { readFileSync } from "fs";

const env = readFileSync("relayer/.env", "utf8");
const privateKey = env.match(/RELAYER_PRIVATE_KEY=([^\n]+)/)[1].trim();

const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(privateKey, provider);

const FORWARDER = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";

console.log("Deploying Router...");
const artifact = JSON.parse(readFileSync("artifacts/contracts/Router.sol/Router.json", "utf8"));
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const router = await factory.deploy(FORWARDER);
await router.waitForDeployment();
const ROUTER = await router.getAddress();
console.log("Router:", ROUTER);

console.log("Creating pool...");
const tx1 = await router.createPool(TKA, TKB);
const receipt1 = await tx1.wait();
console.log("Pool creation tx:", receipt1.hash);

// Verify the pool was actually created
const poolAddr = await router.getPool(TKA, TKB);
if (poolAddr === ethers.ZeroAddress) {
    console.error("❌ Pool creation failed – pool address is still zero.");
    process.exit(1);
}
console.log("✅ Pool address:", poolAddr);

console.log("Approving tokens for Router...");
const amount = ethers.parseEther("1000");
const tka = new ethers.Contract(TKA, ["function approve(address,uint256)"], wallet);
const tkb = new ethers.Contract(TKB, ["function approve(address,uint256)"], wallet);
await tka.approve(ROUTER, amount);
await tkb.approve(ROUTER, amount);
console.log("Approvals done.");

console.log("Adding liquidity...");
const tx2 = await router.addLiquidity(TKA, TKB, amount, amount);
await tx2.wait();
console.log("Liquidity added.");

console.log("\n✅ ALL DONE. Update frontend with:");
console.log(`ROUTER: "${ROUTER}"`);
