import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x71089Ba41e478702e1904692385Be3972B2cBf9e";
  const tokenAAddr = "0x1780bCf4103D3F501463AD3414c7f4b654bb7aFd";
  const tokenBAddr = "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5";
  const poolAddr = "0xD0C43831AB7C05716012B2FDE15598ec10811201";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer address:", deployer.address);
  console.log("\n--- TOKEN BALANCES ---");
  console.log("Deployer TKA:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  console.log("Deployer TKB:", ethers.formatEther(await tokenB.balanceOf(deployer.address)));
  console.log("Pool TKA:", ethers.formatEther(await tokenA.balanceOf(poolAddr)));
  console.log("Pool TKB:", ethers.formatEther(await tokenB.balanceOf(poolAddr)));
  console.log("Router TKA:", ethers.formatEther(await tokenA.balanceOf(routerAddr)));
  
  console.log("\n--- POOL RESERVES ---");
  console.log("Reserve0:", ethers.formatEther(await pool.reserve0()));
  console.log("Reserve1:", ethers.formatEther(await pool.reserve1()));
  
  console.log("\n--- ALLOWANCE ---");
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance:", ethers.formatEther(allowance));
  
  console.log("\n--- TEST SWAP ---");
  const amountIn = ethers.parseEther("10");
  if (allowance < amountIn) {
    console.log("Approving...");
    const approve = await tokenA.approve(routerAddr, amountIn);
    await approve.wait();
  }
  
  try {
    const swap = await router.swap(tokenAAddr, tokenBAddr, amountIn);
    await swap.wait();
    console.log("✅ SWAP SUCCESSFUL!");
  } catch (error) {
    console.log("Swap failed:", error.message);
  }
}

main().catch(console.error);
