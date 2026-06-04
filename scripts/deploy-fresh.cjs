const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Fresh deployment on Sepolia\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // 1. Deploy Forwarder
  console.log("1. Deploying TrustedForwarder...");
  const Forwarder = await hre.ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddr = await forwarder.getAddress();
  console.log("   Forwarder:", forwarderAddr);
  
  // 2. Deploy Tokens
  console.log("\n2. Deploying Tokens...");
  const Token = await hre.ethers.getContractFactory("MockERC20");
  const tka = await Token.deploy("TokenA", "TKA", hre.ethers.parseEther("1000000"));
  const tkb = await Token.deploy("TokenB", "TKB", hre.ethers.parseEther("1000000"));
  await tka.waitForDeployment();
  await tkb.waitForDeployment();
  const tkaAddr = await tka.getAddress();
  const tkbAddr = await tkb.getAddress();
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  
  // 3. Deploy Router
  console.log("\n3. Deploying Router...");
  const Router = await hre.ethers.getContractFactory("Router");
  const router = await Router.deploy(forwarderAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("   Router:", routerAddr);
  
  // 4. Create Pool
  console.log("\n4. Creating Pool...");
  await router.createPool(tkaAddr, tkbAddr);
  const poolAddr = await router.getPool(tkaAddr, tkbAddr);
  console.log("   Pool:", poolAddr);
  
  // 5. Add liquidity
  console.log("\n5. Adding liquidity...");
  const amount = hre.ethers.parseEther("10000");
  await tka.approve(routerAddr, amount);
  await tkb.approve(routerAddr, amount);
  await router.addLiquidity(tkaAddr, tkbAddr, amount, amount);
  console.log("   Added 10,000 TKA + 10,000 TKB");
  
  // 6. Test getAmountOut
  console.log("\n6. Testing getAmountOut...");
  const testAmount = hre.ethers.parseEther("1");
  const expectedOut = await router.getAmountOut(testAmount, tkbAddr, tkaAddr);
  console.log("   getAmountOut(1 TKB) =", hre.ethers.formatEther(expectedOut), "TKA");
  
  // 7. Save addresses
  const config = {
    FORWARDER: forwarderAddr,
    ROUTER: routerAddr,
    TKA: tkaAddr,
    TKB: tkbAddr,
    POOL: poolAddr,
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
  console.log("\n📋 NEW CONTRACT ADDRESSES:");
  console.log("   ROUTER:", routerAddr);
  console.log("   TKA:", tkaAddr);
  console.log("   TKB:", tkbAddr);
  console.log("   POOL:", poolAddr);
  console.log("   FORWARDER:", forwarderAddr);
}

main().catch(console.error);
