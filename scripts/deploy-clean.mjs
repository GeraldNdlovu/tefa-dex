import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Deploy Forwarder
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    console.log("Forwarder:", forwarderAddr);
    
    // Deploy Tokens
    const Token = await ethers.getContractFactory("MockERC20");
    const tokenA = await Token.deploy("TokenA", "TKA", ethers.parseEther("1000000"));
    const tokenB = await Token.deploy("TokenB", "TKB", ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
    const tokenAAddr = await tokenA.getAddress();
    const tokenBAddr = await tokenB.getAddress();
    console.log("TKA:", tokenAAddr);
    console.log("TKB:", tokenBAddr);
    
    // Deploy Router with forwarder
    const Router = await ethers.getContractFactory("Router");
    const router = await Router.deploy(forwarderAddr);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("Router:", routerAddr);
    
    // Create Pool
    const createPoolTx = await router.createPool(tokenAAddr, tokenBAddr);
    await createPoolTx.wait();
    const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
    console.log("Pool:", poolAddr);
    
    // Add liquidity
    const liquidity = ethers.parseEther("10000");
    await tokenA.approve(routerAddr, liquidity);
    await tokenB.approve(routerAddr, liquidity);
    await router.addLiquidity(tokenAAddr, tokenBAddr, liquidity, liquidity);
    console.log("Liquidity added");
    
    console.log("\n✅ Deployment complete!");
    console.log("Forwarder:", forwarderAddr);
    console.log("Router:", routerAddr);
    console.log("TKA:", tokenAAddr);
    console.log("TKB:", tokenBAddr);
    console.log("Pool:", poolAddr);
}

main().catch(console.error);
