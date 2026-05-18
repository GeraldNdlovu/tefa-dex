const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`Deployer: ${wallet.address}\n`);

  // Load artifacts
  const forwarderArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/TrustedForwarder.sol/TrustedForwarder.json"));
  const tokenArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/MockERC20.sol/MockERC20.json"));
  const routerArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/Router.sol/Router.json"));
  const poolArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/Pool.sol/Pool.json"));

  // Deploy Forwarder
  const Forwarder = new ethers.ContractFactory(forwarderArtifact.abi, forwarderArtifact.bytecode, wallet);
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("✅ Forwarder:", forwarderAddr);

  // Deploy Tokens
  const Token = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, wallet);
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log("✅ TKA:", tokenAAddr);
  console.log("✅ TKB:", tokenBAddr);

  // Deploy Router
  const Router = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("✅ Router:", routerAddr);

  // Create Pool
  const tx = await router.createPool(tokenAAddr, tokenBAddr);
  await tx.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("✅ Pool:", poolAddr);

  // Add liquidity
  const amount = ethers.parseEther("1000");
  await tokenA.approve(routerAddr, amount);
  await tokenB.approve(routerAddr, amount);
  await router.addLiquidity(tokenAAddr, tokenBAddr, amount, amount);
  console.log("✅ Liquidity added: 1000 TKA + 1000 TKB");

  // Check LP shares
  const pool = new ethers.Contract(poolAddr, poolArtifact.abi, wallet);
  const shares = await pool.lpShares(wallet.address);
  console.log(`✅ Your LP shares: ${ethers.formatEther(shares)}`);

  console.log("\n=== COPY THESE ADDRESSES ===");
  console.log(`ROUTER: ${routerAddr}`);
  console.log(`TKA: ${tokenAAddr}`);
  console.log(`TKB: ${tokenBAddr}`);
  console.log(`POOL: ${poolAddr}`);
  console.log(`FORWARDER: ${forwarderAddr}`);
}

main().catch(console.error);
