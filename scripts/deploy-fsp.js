import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Sepolia ETH balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  
  console.log("\n📦 Deploying Fee Subsidy Pool Infrastructure to Sepolia...\n");
  
  // ============ DEPLOY NEW CONTRACTS ============
  
  console.log("1. Deploying RelayerRegistry...");
  const RelayerRegistry = await ethers.getContractFactory("RelayerRegistry");
  const relayerRegistry = await RelayerRegistry.deploy();
  await relayerRegistry.waitForDeployment();
  const relayerRegistryAddr = await relayerRegistry.getAddress();
  console.log(`   RelayerRegistry: ${relayerRegistryAddr}`);
  
  console.log("\n2. Deploying EligibilityOracle...");
  const EligibilityOracle = await ethers.getContractFactory("EligibilityOracle");
  const eligibilityOracle = await EligibilityOracle.deploy();
  await eligibilityOracle.waitForDeployment();
  const eligibilityOracleAddr = await eligibilityOracle.getAddress();
  console.log(`   EligibilityOracle: ${eligibilityOracleAddr}`);
  
  console.log("\n3. Deploying FeeSubsidyPool...");
  const FeeSubsidyPool = await ethers.getContractFactory("FeeSubsidyPool");
  const feeSubsidyPool = await FeeSubsidyPool.deploy();
  await feeSubsidyPool.waitForDeployment();
  const fspAddr = await feeSubsidyPool.getAddress();
  console.log(`   FeeSubsidyPool: ${fspAddr}`);
  
  // ============ SEED THE FSP ============
  
  console.log("\n4. Seeding FeeSubsidyPool with 10 ETH...");
  const seedTx = await deployer.sendTransaction({
    to: fspAddr,
    value: ethers.parseEther("5")
  });
  await seedTx.wait();
  console.log("   ✅ FSP seeded with 10 ETH");
  
  // ============ ADD INITIAL RELAYER ============
  
  console.log("\n5. Adding deployer as initial relayer...");
  const RELAYER_ROLE = await feeSubsidyPool.RELAYER_ROLE();
  await feeSubsidyPool.grantRole(RELAYER_ROLE, deployer.address);
  console.log("   ✅ Deployer added as relayer");
  
  // ============ GRANT KEEPER ROLE ============
  
  console.log("\n6. Granting KEEPER_ROLE to deployer...");
  const KEEPER_ROLE = await feeSubsidyPool.KEEPER_ROLE();
  await feeSubsidyPool.grantRole(KEEPER_ROLE, deployer.address);
  console.log("   ✅ KEEPER_ROLE granted");
  
  // ============ UPDATE POOL STATE ============
  
  console.log("\n7. Updating pool state...");
  await feeSubsidyPool.updatePoolState();
  const state = await feeSubsidyPool.currentState();
  console.log(`   Pool state: ${state}`);
  
  // ============ SUMMARY ============
  
  console.log("\n🎉 FEE SUBSIDY POOL DEPLOYED TO SEPOLIA!");
  console.log("\n📋 Contract Addresses:");
  console.log(`   FeeSubsidyPool:   ${fspAddr}`);
  console.log(`   RelayerRegistry:  ${relayerRegistryAddr}`);
  console.log(`   EligibilityOracle: ${eligibilityOracleAddr}`);
  
  console.log("\n📊 Pool Configuration:");
  const maxGasPerTx = await feeSubsidyPool.maxGasPerTx();
  const dailyWalletCap = await feeSubsidyPool.dailyWalletCap();
  const minTradeSize = await feeSubsidyPool.minTradeSize();
  const maxPoolBalance = await feeSubsidyPool.maxPoolBalance();
  console.log(`   Max gas per tx:    ${maxGasPerTx}`);
  console.log(`   Daily wallet cap:  ${dailyWalletCap}`);
  console.log(`   Min trade size:    ${ethers.formatEther(minTradeSize)} ETH`);
  console.log(`   Max pool balance:  ${ethers.formatEther(maxPoolBalance)} ETH`);
  
  const poolBalance = await ethers.provider.getBalance(fspAddr);
  console.log(`\n💾 FSP Balance: ${ethers.formatEther(poolBalance)} ETH`);
  
  console.log("\n🔧 Next Steps:");
  console.log("   1. Add real relayers: await feeSubsidyPool.addRelayer(relayerAddress)");
  console.log("   2. Set up keeper bot to call updatePoolState() every 6 hours");
  console.log("   3. Integrate with existing Router and Pool for gasless swaps");
}

main().catch(console.error);
