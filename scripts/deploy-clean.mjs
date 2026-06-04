import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting clean deployment on Sepolia...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // 1. Deploy Forwarder
  console.log("\n1. Deploying TrustedForwarder...");
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("   Forwarder:", forwarderAddr);
  
  // 2. Deploy Tokens
  console.log("\n2. Deploying Tokens...");
  const Token = await ethers.getContractFactory("MockERC20");
  const tka = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tkb = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tka.waitForDeployment();
  await tkb.waitForDeployment();
  const tkaAddr = await tka.getAddress();
  const tkbAddr = await tkb.getAddress();
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  
  // 3. Deploy Router (with forwarder)
  console.log("\n3. Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
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
  const amount = ethers.parseEther("10000");
  await tka.approve(routerAddr, amount);
  await tkb.approve(routerAddr, amount);
  await router.addLiquidity(tkaAddr, tkbAddr, amount, amount);
  console.log("   Added 10,000 TKA and 10,000 TKB");
  
  // 6. Save all addresses
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
  fs.writeFileSync("frontend/src/config/contracts.ts", 
    `export const CONTRACT_ADDRESSES = {\n` +
    `  ROUTER: "${routerAddr}",\n` +
    `  TKA: "${tkaAddr}",\n` +
    `  TKB: "${tkbAddr}",\n` +
    `  POOL: "${poolAddr}",\n` +
    `  FORWARDER: "${forwarderAddr}"\n` +
    `};\n`
  );
  
  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Saved addresses to deployment.json and frontend config");
  console.log("\n🔑 Forwarder Address (IMPORTANT):", forwarderAddr);
}

main().catch(console.error);
