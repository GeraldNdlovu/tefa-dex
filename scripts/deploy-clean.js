const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Deploy Forwarder first
    const Forwarder = await hre.ethers.getContractFactory("TrustedForwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddr = await forwarder.getAddress();
    console.log("Forwarder:", forwarderAddr);
    
    // Deploy Tokens
    const Token = await hre.ethers.getContractFactory("MockERC20");
    const tokenA = await Token.deploy("TokenA", "TKA", hre.ethers.parseEther("1000000"));
    const tokenB = await Token.deploy("TokenB", "TKB", hre.ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
    const tokenAAddr = await tokenA.getAddress();
    const tokenBAddr = await tokenB.getAddress();
    console.log("TKA:", tokenAAddr);
    console.log("TKB:", tokenBAddr);
    
    // Deploy Router with forwarder address
    const Router = await hre.ethers.getContractFactory("Router");
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
    const liquidity = hre.ethers.parseEther("10000");
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
