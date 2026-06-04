import { ethers } from "ethers";
import { readFileSync } from "fs";

// Load private key from relayer .env
const env = readFileSync("relayer/.env", "utf8");
const privateKey = env.match(/RELAYER_PRIVATE_KEY=([^\n]+)/)[1].trim();
const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(privateKey, provider);

const FORWARDER = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
const AMOUNT = ethers.parseEther("1000");

console.log(`Deployer: ${wallet.address}`);
const tokenA = new ethers.Contract(TKA, [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
], wallet);
const tokenB = new ethers.Contract(TKB, [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
], wallet);

// Check balances first
const balA = await tokenA.balanceOf(wallet.address);
const balB = await tokenB.balanceOf(wallet.address);
console.log(`TKA balance: ${ethers.formatEther(balA)}`);
console.log(`TKB balance: ${ethers.formatEther(balB)}`);
if (balA < AMOUNT || balB < AMOUNT) {
    console.error("❌ Insufficient token balance. Need at least 1000 of each.");
    process.exit(1);
}

// Deploy Router
console.log("\nDeploying Router...");
const artifact = JSON.parse(readFileSync("artifacts/contracts/Router.sol/Router.json", "utf8"));
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const router = await factory.deploy(FORWARDER);
await router.waitForDeployment();
const ROUTER = await router.getAddress();
console.log(`✅ Router deployed: ${ROUTER}`);

// Approve Router to spend tokens (explicitly with a high gas limit to avoid estimation issues)
console.log("\nApproving Router to spend TKA and TKB...");
const approveA = await tokenA.approve(ROUTER, AMOUNT, { gasLimit: 100000 });
await approveA.wait();
const approveB = await tokenB.approve(ROUTER, AMOUNT, { gasLimit: 100000 });
await approveB.wait();

// Verify allowances
const allowanceA = await tokenA.allowance(wallet.address, ROUTER);
const allowanceB = await tokenB.allowance(wallet.address, ROUTER);
console.log(`Allowance TKA: ${ethers.formatEther(allowanceA)}`);
console.log(`Allowance TKB: ${ethers.formatEther(allowanceB)}`);
if (allowanceA < AMOUNT || allowanceB < AMOUNT) {
    console.error("❌ Approval failed. Allowance still insufficient.");
    process.exit(1);
}

// Create pool
console.log("\nCreating pool...");
const createTx = await router.createPool(TKA, TKB);
await createTx.wait();
const poolAddr = await router.getPool(TKA, TKB);
if (poolAddr === ethers.ZeroAddress) {
    console.error("❌ Pool creation failed – pool address is zero.");
    process.exit(1);
}
console.log(`✅ Pool created: ${poolAddr}`);

// Add liquidity
console.log("\nAdding liquidity...");
// Use a manual gas limit to avoid estimation failures
const addLiqTx = await router.addLiquidity(TKA, TKB, AMOUNT, AMOUNT, { gasLimit: 500000 });
await addLiqTx.wait();

// Verify reserves
const pool = new ethers.Contract(poolAddr, [
    "function reserve0() view returns (uint256)",
    "function reserve1() view returns (uint256)"
], provider);
const r0 = await pool.reserve0();
const r1 = await pool.reserve1();
console.log(`Reserves: ${ethers.formatEther(r0)} TKA, ${ethers.formatEther(r1)} TKB`);

console.log("\n✅ DONE. New Router ready.");
console.log(`ROUTER: "${ROUTER}"`);
console.log(`POOL: "${poolAddr}"`);
