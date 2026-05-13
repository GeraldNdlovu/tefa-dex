import { network } from "hardhat";
import fs from "fs";

async function deployWithRetry(contractName, ...args) {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const Contract = await ethers.getContractFactory(contractName);
            const contract = await Contract.deploy(...args, {
                gasPrice: ethers.parseUnits("30", "gwei"),
                gasLimit: 5000000
            });
            await contract.waitForDeployment();
            return contract;
        } catch (error) {
            console.log(`   Retry ${i + 1}/${maxRetries} for ${contractName}...`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    console.log("\n🚀 Deploying to Sepolia");
    console.log(`   Deployer: ${deployer.address}\n`);
    
    // Get current nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`   Current nonce: ${nonce}\n`);
    
    // 1. Deploy Forwarder
    console.log("1. Deploying TrustedForwarder...");
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy({
        nonce: nonce,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 2000000
    });
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    console.log(`   ✅ Forwarder: ${forwarderAddr}`);
    
    // 2. Deploy Tokens
    console.log("\n2. Deploying Tokens...");
    const Token = await ethers.getContractFactory("MockERC20");
    
    const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"), {
        nonce: nonce + 1,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 3000000
    });
    await tokenA.waitForDeployment();
    const tokenAAddr = await tokenA.getAddress();
    console.log(`   ✅ TKA: ${tokenAAddr}`);
    
    const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"), {
        nonce: nonce + 2,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 3000000
    });
    await tokenB.waitForDeployment();
    const tokenBAddr = await tokenB.getAddress();
    console.log(`   ✅ TKB: ${tokenBAddr}`);
    
    // 3. Deploy Standard Router
    console.log("\n3. Deploying Standard Router...");
    const Router = await ethers.getContractFactory("Router");
    const standardRouter = await Router.deploy(forwarderAddr, {
        nonce: nonce + 3,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 3000000
    });
    await standardRouter.waitForDeployment();
    const standardRouterAddr = await standardRouter.getAddress();
    console.log(`   ✅ Standard Router: ${standardRouterAddr}`);
    
    // 4. Create Pool
    console.log("\n4. Creating Pool...");
    const tx = await standardRouter.createPool(tokenAAddr, tokenBAddr, {
        nonce: nonce + 4,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 2000000
    });
    await tx.wait();
    const poolAddr = await standardRouter.getPool(tokenAAddr, tokenBAddr);
    console.log(`   ✅ Pool: ${poolAddr}`);
    
    // 5. Add Liquidity
    console.log("\n5. Adding Liquidity...");
    const liquidity = ethers.parseEther("10000");
    await tokenA.approve(standardRouterAddr, liquidity, {
        nonce: nonce + 5,
        gasPrice: ethers.parseUnits("30", "gwei")
    });
    await tokenB.approve(standardRouterAddr, liquidity, {
        nonce: nonce + 6,
        gasPrice: ethers.parseUnits("30", "gwei")
    });
    await standardRouter.addLiquidity(tokenAAddr, tokenBAddr, liquidity, liquidity, {
        nonce: nonce + 7,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 2000000
    });
    console.log(`   ✅ Liquidity added`);
    
    // 6. Deploy Gasless Router
    console.log("\n6. Deploying Gasless Router...");
    const gaslessRouter = await Router.deploy(forwarderAddr, {
        nonce: nonce + 8,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 3000000
    });
    await gaslessRouter.waitForDeployment();
    const gaslessRouterAddr = await gaslessRouter.getAddress();
    console.log(`   ✅ Gasless Router: ${gaslessRouterAddr}`);
    
    // 7. Register existing pool
    console.log("\n7. Registering pool with Gasless Router...");
    const registerTx = await gaslessRouter.registerPool(tokenAAddr, tokenBAddr, poolAddr, {
        nonce: nonce + 9,
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 2000000
    });
    await registerTx.wait();
    console.log(`   ✅ Pool registered`);
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEPOLIA DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log(`   Forwarder: ${forwarderAddr}`);
    console.log(`   TKA: ${tokenAAddr}`);
    console.log(`   TKB: ${tokenBAddr}`);
    console.log(`   Standard Router: ${standardRouterAddr}`);
    console.log(`   Gasless Router: ${gaslessRouterAddr}`);
    console.log(`   Pool: ${poolAddr}`);
    console.log("=".repeat(50) + "\n");
    
    // Save addresses
    const addresses = {
        forwarder: forwarderAddr,
        tka: tokenAAddr,
        tkb: tokenBAddr,
        standardRouter: standardRouterAddr,
        gaslessRouter: gaslessRouterAddr,
        pool: poolAddr,
        network: "sepolia",
        chainId: 11155111
    };
    fs.writeFileSync("deployed-sepolia.json", JSON.stringify(addresses, null, 2));
    console.log("📁 Addresses saved to deployed-sepolia.json");
}

main().catch(console.error);
