import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting clean deployment on Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Get contract factories using hre
  const Forwarder = await hre.ethers.getContractFactory("TrustedForwarder");
  const Token = await hre.ethers.getContractFactory("MockERC20");
  const Router = await hre.ethers.getContractFactory("Router");
  
  // 1. Deploy Forwarder
  console.log("1. Deploying TrustedForwarder...");
  const forwarder = await Forwarder.connect(deployer).deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("   Forwarder:", forwarderAddr);
  
  // 2. Deploy Tokens
  console.log("\n2. Deploying Tokens...");
  const tka = await Token.connect(deployer).deploy("TokenA", "TKA", hre.ethers.parseEther("1000000"));
  const tkb = await Token.connect(deployer).deploy("TokenB", "TKB", hre.ethers.parseEther("1000000"));
  await tka.waitForDeployment();
  await tkb.waitForDeployment();
  const tkaAddr = await tka.getAddress();
  const tkbAddr = await tkb.getAddress();
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  
  // 3. Deploy Router
  console.log("\n3. Deploying Router...");
  const router = await Router.connect(deployer).deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("   Router:", routerAddr);
  
  // 4. Create Pool
  console.log("\n4. Creating Pool...");
  await router.createPool(tkaAddr, tkbAddr);
  const poolAddr = await router.getPool(tkaAddr, tkbAddr);
  console.log("   Pool:", poolAddr);
  
  // 5. Add initial liquidity
  console.log("\n5. Adding initial liquidity...");
  const amount = hre.ethers.parseEther("10000");
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
  console.log("\n📋 FORWARDER ADDRESS (IMPORTANT):", forwarderAddr);
  console.log("\n📋 All addresses saved to deployment.json and frontend config");
}

main().catch(console.error);
