const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // Load private key from .env file
  const envContent = fs.readFileSync(".env", "utf8");
  const privateKeyMatch = envContent.match(/PRIVATE_KEY=(.+)/);
  const PRIVATE_KEY = privateKeyMatch ? privateKeyMatch[1].trim() : null;
  
  if (!PRIVATE_KEY || PRIVATE_KEY === "0xYOUR_PRIVATE_KEY") {
    console.error("❌ Please set a valid PRIVATE_KEY in .env file");
    process.exit(1);
  }
  
  const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("🚀 Starting clean deployment on Sepolia...\n");
  console.log("Deployer:", wallet.address);
  const balance = await wallet.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH\n");
  
  // 1. Deploy Forwarder
  console.log("1. Deploying TrustedForwarder...");
  const Forwarder = await ethers.getContractFactory("TrustedForwarder", wallet);
  const forwarder = await Forwarder.deploy();
  await forwarder.deployed();
  const forwarderAddr = forwarder.address;
  console.log("   Forwarder:", forwarderAddr);
  
  // 2. Deploy Tokens
  console.log("\n2. Deploying Tokens...");
  const Token = await ethers.getContractFactory("MockERC20", wallet);
  const tka = await Token.deploy("TokenA", "TKA", ethers.utils.parseEther("1000000"));
  const tkb = await Token.deploy("TokenB", "TKB", ethers.utils.parseEther("1000000"));
  await tka.deployed();
  await tkb.deployed();
  const tkaAddr = tka.address;
  const tkbAddr = tkb.address;
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  
  // 3. Deploy Router
  console.log("\n3. Deploying Router...");
  const Router = await ethers.getContractFactory("Router", wallet);
  const router = await Router.deploy(forwarderAddr);
  await router.deployed();
  const routerAddr = router.address;
  console.log("   Router:", routerAddr);
  
  // 4. Create Pool
  console.log("\n4. Creating Pool...");
  await router.createPool(tkaAddr, tkbAddr);
  const poolAddr = await router.getPool(tkaAddr, tkbAddr);
  console.log("   Pool:", poolAddr);
  
  // 5. Add initial liquidity
  console.log("\n5. Adding initial liquidity...");
  const amount = ethers.utils.parseEther("10000");
  await tka.approve(routerAddr, amount);
  await tkb.approve(routerAddr, amount);
  await router.addLiquidity(tkaAddr, tkbAddr, amount, amount);
  console.log("   Added 10,000 TKA and 10,000 TKB");
  
  // 6. Save addresses
  const config = {
    FORWARDER: forwarderAddr,
    ROUTER: routerAddr,
    TKA: tkaAddr,
    TKB: tkbAddr,
    POOL: poolAddr,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync("deployment.json", JSON.stringify(config, null, 2));
  
  // Update frontend config
  const frontendConfig = `export const CONTRACT_ADDRESSES = {
  ROUTER: "${routerAddr}",
  TKA: "${tkaAddr}",
  TKB: "${tkbAddr}",
  POOL: "${poolAddr}",
  FORWARDER: "${forwarderAddr}"
};\n`;
  
  fs.writeFileSync("frontend/src/config/contracts.ts", frontendConfig);
  
  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Saved addresses:");
  console.log("   FORWARDER:", forwarderAddr);
  console.log("   ROUTER:", routerAddr);
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  console.log("   POOL:", poolAddr);
}

main().catch(console.error);
