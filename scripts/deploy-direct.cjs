const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // Read private key from .env file in parent directory
  const envPath = "/root/tefa-dex/.env";
  const envContent = fs.readFileSync(envPath, "utf8");
  const privateKeyMatch = envContent.match(/PRIVATE_KEY=(.+)/);
  const PRIVATE_KEY = privateKeyMatch ? privateKeyMatch[1].trim() : null;
  
  if (!PRIVATE_KEY || PRIVATE_KEY === "0xYOUR_PRIVATE_KEY") {
    console.error("❌ Please set a valid PRIVATE_KEY in .env file");
    process.exit(1);
  }
  
  console.log("Private key loaded successfully");
  
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");
  
  // Need to get contract factories from Hardhat artifacts
  // First compile
  const { execSync } = require("child_process");
  console.log("Compiling contracts...");
  execSync("npx hardhat compile", { stdio: "inherit", cwd: "/root/tefa-dex" });
  
  // Load artifacts
  const forwarderArtifact = require("/root/tefa-dex/artifacts/contracts/TrustedForwarder.sol/TrustedForwarder.json");
  const tokenArtifact = require("/root/tefa-dex/artifacts/contracts/MockERC20.sol/MockERC20.json");
  const routerArtifact = require("/root/tefa-dex/artifacts/contracts/Router.sol/Router.json");
  
  console.log("\n1. Deploying TrustedForwarder...");
  const forwarderFactory = new ethers.ContractFactory(forwarderArtifact.abi, forwarderArtifact.bytecode, wallet);
  const forwarder = await forwarderFactory.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("   Forwarder:", forwarderAddr);
  
  console.log("\n2. Deploying Tokens...");
  const tokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, wallet);
  const tka = await tokenFactory.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tkb = await tokenFactory.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tka.waitForDeployment();
  await tkb.waitForDeployment();
  const tkaAddr = await tka.getAddress();
  const tkbAddr = await tkb.getAddress();
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  
  console.log("\n3. Deploying Router...");
  const routerFactory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
  const router = await routerFactory.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("   Router:", routerAddr);
  
  console.log("\n4. Creating Pool...");
  await router.createPool(tkaAddr, tkbAddr);
  const poolAddr = await router.getPool(tkaAddr, tkbAddr);
  console.log("   Pool:", poolAddr);
  
  console.log("\n5. Adding initial liquidity...");
  const amount = ethers.parseEther("10000");
  await tka.approve(routerAddr, amount);
  await tkb.approve(routerAddr, amount);
  await router.addLiquidity(tkaAddr, tkbAddr, amount, amount);
  console.log("   Added 10,000 TKA and 10,000 TKB");
  
  // Save addresses
  const config = {
    FORWARDER: forwarderAddr,
    ROUTER: routerAddr,
    TKA: tkaAddr,
    TKB: tkbAddr,
    POOL: poolAddr
  };
  
  fs.writeFileSync("/root/tefa-dex/deployment.json", JSON.stringify(config, null, 2));
  
  const frontendConfig = `export const CONTRACT_ADDRESSES = {
  ROUTER: "${routerAddr}",
  TKA: "${tkaAddr}",
  TKB: "${tkbAddr}",
  POOL: "${poolAddr}",
  FORWARDER: "${forwarderAddr}"
};\n`;
  
  fs.writeFileSync("/root/tefa-dex/frontend/src/config/contracts.ts", frontendConfig);
  
  console.log("\n✅ Deployment complete!");
  console.log("\n📋 FORWARDER ADDRESS:", forwarderAddr);
  console.log("   Save this address for gasless swaps");
}

main().catch(console.error);
