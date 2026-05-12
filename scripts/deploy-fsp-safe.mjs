import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(address);
    
    console.log("\nDeployer:", address);
    console.log("Sepolia ETH balance:", ethers.formatEther(balance));
    
    console.log("\n📦 Deploying Fee Subsidy Pool Infrastructure to Sepolia...\n");
    
    // 1. Deploy RelayerRegistry
    console.log("1. Deploying RelayerRegistry...");
    const RelayerRegistry = await ethers.getContractFactory("RelayerRegistry");
    const relayerRegistry = await RelayerRegistry.deploy();
    await relayerRegistry.waitForDeployment();
    const relayerRegistryAddr = await relayerRegistry.getAddress();
    console.log("   RelayerRegistry:", relayerRegistryAddr);
    
    // 2. Deploy EligibilityOracle
    console.log("\n2. Deploying EligibilityOracle...");
    const EligibilityOracle = await ethers.getContractFactory("EligibilityOracle");
    const eligibilityOracle = await EligibilityOracle.deploy();
    await eligibilityOracle.waitForDeployment();
    const eligibilityOracleAddr = await eligibilityOracle.getAddress();
    console.log("   EligibilityOracle:", eligibilityOracleAddr);
    
    // 3. Deploy FeeSubsidyPool (no treasury param needed)
    console.log("\n3. Deploying FeeSubsidyPool...");
    const FeeSubsidyPool = await ethers.getContractFactory("FeeSubsidyPool");
    const feeSubsidyPool = await FeeSubsidyPool.deploy(
        relayerRegistryAddr,
        eligibilityOracleAddr
    );
    await feeSubsidyPool.waitForDeployment();
    const feeSubsidyPoolAddr = await feeSubsidyPool.getAddress();
    console.log("   FeeSubsidyPool:", feeSubsidyPoolAddr);
    
    // 4. Deploy Treasury
    console.log("\n4. Deploying Treasury...");
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
    const treasuryAddr = await treasury.getAddress();
    console.log("   Treasury:", treasuryAddr);
    
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
    
    // 7. Send ETH directly to FeeSubsidyPool (0.01 ETH)
    console.log("\n7. Seeding FeeSubsidyPool with 0.01 ETH...");
    const tx3 = await deployer.sendTransaction({
        to: feeSubsidyPoolAddr,
        value: ethers.parseEther("0.01")
    });
    await tx3.wait();
    console.log("   ✅ Pool funded");
    
    // 8. Also fund Treasury with some ETH
    console.log("\n8. Seeding Treasury with 0.01 ETH...");
    const tx4 = await deployer.sendTransaction({
        to: treasuryAddr,
        value: ethers.parseEther("0.01")
    });
    await tx4.wait();
    console.log("   ✅ Treasury funded");
    
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
