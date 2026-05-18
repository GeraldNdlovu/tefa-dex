const { ethers } = require("ethers");
const fs = require("fs");

// Load private key from .env
require("dotenv").config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract ABIs (minimal)
const FORWARDER_ABI = [ "function deploy()" ];
const TOKEN_ABI = [ "function deploy(string name, string symbol, uint256 initialSupply)" ];
const ROUTER_ABI = [ "function deploy(address trustedForwarder)" ];
const POOL_ABI = [ "constructor(address _token0, address _token1)" ];

// Compiled bytecode – we'll read from artifacts
const forwarderArtifact = require("./artifacts/contracts/TrustedForwarder.sol/TrustedForwarder.json");
const tokenArtifact = require("./artifacts/contracts/MockERC20.sol/MockERC20.json");
const routerArtifact = require("./artifacts/contracts/Router.sol/Router.json");
const poolArtifact = require("./artifacts/contracts/Pool.sol/Pool.json");

async function main() {
  console.log("\n🚀 Deploying fixed contracts on Sepolia\n");
  console.log(`Deployer: ${wallet.address}\n`);

  // 1. TrustedForwarder
  const ForwarderFactory = new ethers.ContractFactory(forwarderArtifact.abi, forwarderArtifact.bytecode, wallet);
  const forwarder = await ForwarderFactory.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log(`✅ TrustedForwarder: ${forwarderAddr}`);

  // 2. Tokens
  const TokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, wallet);
  const tokenA = await TokenFactory.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await TokenFactory.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  console.log(`✅ TokenA (TKA): ${tokenAAddr}`);
  console.log(`✅ TokenB (TKB): ${tokenBAddr}`);

  // 3. Router
  const RouterFactory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
  const router = await RouterFactory.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`✅ Router: ${routerAddr}`);

  // 4. Create Pool (Router creates Pool)
  const txCreate = await router.createPool(tokenAAddr, tokenBAddr);
  await txCreate.wait();
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log(`✅ Pool: ${poolAddr}`);

  // 5. Add initial liquidity (1000 TKA + 1000 TKB)
  const amount = ethers.parseEther("1000");
  await tokenA.approve(routerAddr, amount);
  await tokenB.approve(routerAddr, amount);
  await router.addLiquidity(tokenAAddr, tokenBAddr, amount, amount);
  console.log(`✅ Added ${ethers.formatEther(amount)} TKA + ${ethers.formatEther(amount)} TKB`);

  // 6. Check LP shares
  const pool = new ethers.Contract(poolAddr, poolArtifact.abi, wallet);
  const shares = await pool.lpShares(wallet.address);
  console.log(`\n📊 Your LP shares: ${ethers.formatEther(shares)}`);
  console.log(`📊 Total LP shares: ${ethers.formatEther(await pool.totalLpShares())}`);

  console.log("\n========================================");
  console.log("✅ DEPLOYMENT SUCCESSFUL");
  console.log("========================================");
  console.log(`ROUTER:    ${routerAddr}`);
  console.log(`TOKEN_A:   ${tokenAAddr}`);
  console.log(`TOKEN_B:   ${tokenBAddr}`);
  console.log(`POOL:      ${poolAddr}`);
  console.log(`FORWARDER: ${forwarderAddr}`);
}

main().catch(console.error);
