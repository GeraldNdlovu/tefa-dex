const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await hre.ethers.provider.getBalance(address);
    
    console.log("\nDeployer:", address);
    console.log("Sepolia ETH balance:", hre.ethers.formatEther(balance));
    
    console.log("\n📦 Deploying Fee Subsidy Pool Infrastructure to Sepolia...\n");
    
    // 1. Deploy RelayerRegistry
    console.log("1. Deploying RelayerRegistry...");
    const RelayerRegistry = await hre.ethers.getContractFactory("RelayerRegistry");
    const relayerRegistry = await RelayerRegistry.deploy();
    await relayerRegistry.waitForDeployment();
    const relayerRegistryAddr = await relayerRegistry.getAddress();
    console.log("   RelayerRegistry:", relayerRegistryAddr);
    
    // 2. Deploy EligibilityOracle
    console.log("\n2. Deploying EligibilityOracle...");
    const EligibilityOracle = await hre.ethers.getContractFactory("EligibilityOracle");
    const eligibilityOracle = await EligibilityOracle.deploy();
    await eligibilityOracle.waitForDeployment();
    const eligibilityOracleAddr = await eligibilityOracle.getAddress();
    console.log("   EligibilityOracle:", eligibilityOracleAddr);
    
    // 3. Deploy Treasury
    console.log("\n3. Deploying Treasury...");
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
    const treasuryAddr = await treasury.getAddress();
    console.log("   Treasury:", treasuryAddr);
    
    // 4. Deploy FeeSubsidyPool
    console.log("\n4. Deploying FeeSubsidyPool...");
    const FeeSubsidyPool = await hre.ethers.getContractFactory("FeeSubsidyPool");
    const feeSubsidyPool = await FeeSubsidyPool.deploy(
        treasuryAddr,
        relayerRegistryAddr,
        eligibilityOracleAddr
    );
    await feeSubsidyPool.waitForDeployment();
    const feeSubsidyPoolAddr = await feeSubsidyPool.getAddress();
    console.log("   FeeSubsidyPool:", feeSubsidyPoolAddr);
    
    // 5. Set FeeSubsidyPool in Treasury
    console.log("\n5. Connecting Treasury to FeeSubsidyPool...");
    const tx1 = await treasury.setFeeSubsidyPool(feeSubsidyPoolAddr);
    await tx1.wait();
    console.log("   ✅ Treasury connected");
    
    // 6. Add relayer (deployer)
    console.log("\n6. Adding relayer...");
    const tx2 = await relayerRegistry.addRelayer(address);
    await tx2.wait();
    console.log("   ✅ Relayer added:", address);
    
    // 7. Seed the pool - send ETH directly to Treasury first
    console.log("\n7. Seeding Treasury with 1 ETH...");
    const tx3 = await deployer.sendTransaction({
        to: treasuryAddr,
        value: hre.ethers.parseEther("1")
    });
    await tx3.wait();
    console.log("   ✅ Treasury funded");
    
    // 8. Allocate to FSP
    console.log("\n8. Allocating to FeeSubsidyPool...");
    const tx4 = await treasury.allocateToFSP(hre.ethers.parseEther("1"));
    await tx4.wait();
    console.log("   ✅ Pool seeded");
    
    console.log("\n========================================");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("========================================");
    console.log("📋 Contract Addresses:");
    console.log("   RelayerRegistry:", relayerRegistryAddr);
    console.log("   EligibilityOracle:", eligibilityOracleAddr);
    console.log("   Treasury:", treasuryAddr);
    console.log("   FeeSubsidyPool:", feeSubsidyPoolAddr);
    console.log("========================================\n");
}

main().catch(console.error);
