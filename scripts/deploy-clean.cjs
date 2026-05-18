const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // 1. TrustedForwarder (no args)
  const Forwarder = await ethers.getContractFactory("TrustedForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  console.log(`✅ TrustedForwarder: ${await forwarder.getAddress()}`);

  // 2. Tokens (name, symbol, supply)
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
  const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();
  console.log(`✅ TokenA (TKA): ${await tokenA.getAddress()}`);
  console.log(`✅ TokenB (TKB): ${await tokenB.getAddress()}`);

  // 3. Router (takes forwarder address)
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(await forwarder.getAddress());
  await router.waitForDeployment();
  console.log(`✅ Router: ${await router.getAddress()}`);

  // 4. Create Pool (Router creates Pool)
  const txCreate = await router.createPool(await tokenA.getAddress(), await tokenB.getAddress());
  await txCreate.wait();
  const poolAddr = await router.getPool(await tokenA.getAddress(), await tokenB.getAddress());
  console.log(`✅ Pool: ${poolAddr}`);

  // 5. Add initial liquidity
  const amount = ethers.parseEther("1000");
  await tokenA.approve(await router.getAddress(), amount);
  await tokenB.approve(await router.getAddress(), amount);
  await router.addLiquidity(await tokenA.getAddress(), await tokenB.getAddress(), amount, amount);
  console.log(`✅ Added ${ethers.formatEther(amount)} TKA + ${ethers.formatEther(amount)} TKB`);

  // 6. Verify LP shares
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const shares = await pool.lpShares(deployer.address);
  console.log(`\n📊 Your LP shares: ${ethers.formatEther(shares)}`);
  console.log(`📊 Total LP shares: ${ethers.formatEther(await pool.totalLpShares())}`);

  console.log("\n========================================");
  console.log("✅ DEPLOYMENT SUCCESSFUL");
  console.log("========================================");
  console.log(`ROUTER:   ${await router.getAddress()}`);
  console.log(`TOKEN_A:  ${await tokenA.getAddress()}`);
  console.log(`TOKEN_B:  ${await tokenB.getAddress()}`);
  console.log(`POOL:     ${poolAddr}`);
  console.log(`FORWARDER: ${await forwarder.getAddress()}`);
}

main().catch(console.error);
