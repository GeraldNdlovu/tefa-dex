const { ethers } = require("ethers");
const fs = require("fs");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract addresses from previous steps
const FORWARDER = "0x156eAdE98182972A15F8eb86546226E0341355b1";
const TKA = "0x47399fE0154349729661E98e30D0e62FCD0f0CB1";
const TKB = "0x4149240BCD983406345D78069e99F3Dad1C2B94B";

const routerArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/Router.sol/Router.json", "utf8"));
const tokenArtifact = JSON.parse(fs.readFileSync("artifacts/contracts/MockERC20.sol/MockERC20.json", "utf8"));

async function main() {
  console.log("1. Deploying Router...");
  const routerFactory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
  const router = await routerFactory.deploy(FORWARDER);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("   ✅ Router deployed at:", routerAddr);
  
  console.log("\n2. Creating Pool...");
  const tx = await router.createPool(TKA, TKB);
  await tx.wait();
  const poolAddr = await router.getPool(TKA, TKB);
  console.log("   ✅ Pool created at:", poolAddr);
  
  console.log("\n3. Adding liquidity...");
  const amount = ethers.parseEther("10000");
  
  // Get token contracts
  const tka = new ethers.Contract(TKA, tokenArtifact.abi, wallet);
  const tkb = new ethers.Contract(TKB, tokenArtifact.abi, wallet);
  
  console.log("   Approving TKA...");
  const approve1 = await tka.approve(routerAddr, amount);
  await approve1.wait();
  
  console.log("   Approving TKB...");
  const approve2 = await tkb.approve(routerAddr, amount);
  await approve2.wait();
  
  console.log("   Adding 10,000 TKA + 10,000 TKB to pool...");
  const addLiq = await router.addLiquidity(TKA, TKB, amount, amount);
  await addLiq.wait();
  console.log("   ✅ Liquidity added!");
  
  console.log("\n4. Testing getAmountOut...");
  const testAmount = ethers.parseEther("1");
  const expectedOut = await router.getAmountOut(testAmount, TKB, TKA);
  console.log("   ✅ getAmountOut(1 TKB) =", ethers.formatEther(expectedOut), "TKA");
  
  // Save all addresses
  const config = {
    FORWARDER: FORWARDER,
    ROUTER: routerAddr,
    TKA: TKA,
    TKB: TKB,
    POOL: poolAddr,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync("deployment-complete.json", JSON.stringify(config, null, 2));
  
  // Update frontend config
  const frontendConfig = `export const CONTRACT_ADDRESSES = {
  ROUTER: "${routerAddr}",
  TKA: "${TKA}",
  TKB: "${TKB}",
  POOL: "${poolAddr}",
  FORWARDER: "${FORWARDER}"
};\n`;
  
  fs.writeFileSync("frontend/src/config/contracts.ts", frontendConfig);
  
  console.log("\n✅✅✅ ALL DEPLOYMENTS COMPLETE! ✅✅✅");
  console.log("\n📋 FINAL CONTRACT ADDRESSES:");
  console.log("   FORWARDER:", FORWARDER);
  console.log("   ROUTER:", routerAddr);
  console.log("   TKA:", TKA);
  console.log("   TKB:", TKB);
  console.log("   POOL:", poolAddr);
}

main().catch(console.error);
