import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    
    // Contract addresses
    const RELAYER_REGISTRY = "0x37610cBb430F8f46214dD30aD8736DBa698ACf9F";
    const ELIGIBILITY_ORACLE = "0x33342c062e92c8cbB95fD128bCC43D92cfc96467";
    const TREASURY = "0x45F811400e3018993726bCc515DDB50A4a3E89c0";
    const FEE_SUBSIDY_POOL = "0xEcB93d5378985BAe86Bd727dddDB92884519f328";
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 TESTING FEE SUBSIDY FLOW");
    console.log("=".repeat(60));
    
    // Get contract instances
    const relayerRegistry = await ethers.getContractAt("RelayerRegistry", RELAYER_REGISTRY);
    const eligibilityOracle = await ethers.getContractAt("EligibilityOracle", ELIGIBILITY_ORACLE);
    const treasury = await ethers.getContractAt("Treasury", TREASURY);
    const fsp = await ethers.getContractAt("FeeSubsidyPool", FEE_SUBSIDY_POOL);
    
    // 1. Check if deployer is a whitelisted relayer
    console.log("\n1️⃣ Checking relayer status...");
    const isRelayer = await relayerRegistry.isRelayer(address);
    console.log(`   Is ${address.slice(0, 10)}... a relayer? ${isRelayer}`);
    
    // 2. Check user eligibility for subsidy
    console.log("\n2️⃣ Checking user eligibility...");
    const [eligible, dailyLeft] = await fsp.getEligibility(address);
    console.log(`   Eligible for subsidy? ${eligible}`);
    console.log(`   Daily transactions left: ${dailyLeft}`);
    
    // 3. Update user eligibility in oracle (using correct function name)
    console.log("\n3️⃣ Updating user eligibility...");
    try {
        // Grant KEEPER_ROLE to deployer first
        const KEEPER_ROLE = await eligibilityOracle.KEEPER_ROLE();
        const hasRole = await eligibilityOracle.hasRole(KEEPER_ROLE, address);
        if (!hasRole) {
            console.log("   Granting KEEPER_ROLE to deployer...");
            await eligibilityOracle.grantRole(KEEPER_ROLE, address);
        }
        
        // Use correct function: updateUserVolume (not updateUserStats)
        const tx = await eligibilityOracle.updateUserVolume(address, ethers.parseEther("600"));
        await tx.wait();
        console.log("   ✅ User stats updated (volume: 600)");
    } catch (error) {
        console.log("   ⚠️ Could not update:", error.message);
    }
    
    // 4. Check eligibility again
    console.log("\n4️⃣ Re-checking eligibility...");
    const [eligibleAfter, dailyLeftAfter] = await fsp.getEligibility(address);
    console.log(`   Eligible for subsidy? ${eligibleAfter}`);
    console.log(`   Daily transactions left: ${dailyLeftAfter}`);
    
    // 5. Get pool balance
    console.log("\n5️⃣ Checking FeeSubsidyPool balance...");
    const poolBalance = await ethers.provider.getBalance(FEE_SUBSIDY_POOL);
    console.log(`   Pool balance: ${ethers.formatEther(poolBalance)} ETH`);
    
    // 6. Get Treasury balance (fixed typo)
    console.log("\n6️⃣ Checking Treasury balance...");
    const treasuryBalance = await ethers.provider.getBalance(TREASURY);
    console.log(`   Treasury balance: ${ethers.formatEther(treasuryBalance)} ETH`);
    
    // 7. Simulate a claim (only if eligible and pool has funds)
    if (eligibleAfter && poolBalance > 0) {
        console.log("\n7️⃣ Simulating subsidy claim...");
        const txHash = ethers.id("test-transaction-" + Date.now());
        const gasUsed = 150000;
        const gasPrice = ethers.parseUnits("20", "gwei");
        
        try {
            const claimTx = await fsp.claimReimbursement(
                txHash,
                address,
                gasUsed,
                gasPrice
            );
            await claimTx.wait();
            console.log("   ✅ Claim successful!");
        } catch (error) {
            console.log("   ❌ Claim failed:", error.message);
        }
    } else {
        console.log("\n7️⃣ Skipping claim - not eligible or pool empty");
        if (!eligibleAfter) console.log("   Reason: Not eligible");
        if (poolBalance == 0) console.log("   Reason: Pool has no funds");
    }
    
    // 8. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`   Relayer status: ${isRelayer ? "✅ Active" : "❌ Not active"}`);
    console.log(`   Eligibility: ${eligibleAfter ? "✅ Yes" : "❌ No"}`);
    console.log(`   Pool balance: ${ethers.formatEther(poolBalance)} ETH`);
    console.log(`   Treasury balance: ${ethers.formatEther(treasuryBalance)} ETH`);
    console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
