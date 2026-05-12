import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x71089Ba41e478702e1904692385Be3972B2cBf9e";
  const tokenAAddr = "0x1780bCf4103D3F501463AD3414c7f4b654bb7aFd";
  const tokenBAddr = "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("TKA Balance:", ethers.formatEther(balance));
  
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance:", ethers.formatEther(allowance));
  
  const amountIn = ethers.parseEther("10");
  
  if (allowance < amountIn) {
    console.log("\nApproving...");
    const approveTx = await tokenA.approve(routerAddr, amountIn);
    await approveTx.wait();
    console.log("Approved!");
  }
  
  console.log("\nTrying swap...");
  try {
    const swapTx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
    await swapTx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("Swap failed:", error.message);
    // Try to see what the router's swap function is doing
    const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
    console.log("Pool address:", poolAddr);
    const pool = await ethers.getContractAt("Pool", poolAddr);
    console.log("Pool reserve0:", ethers.formatEther(await pool.reserve0()));
    console.log("Pool reserve1:", ethers.formatEther(await pool.reserve1()));
  }
}

main().catch(console.error);
