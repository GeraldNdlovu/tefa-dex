import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5";
  const poolAddr = "0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d";
  const tokenAAddr = "0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25";
  const tokenBAddr = "0xD84379CEae14AA33C123Af12424A37803F885889";
  
  const [deployer] = await ethers.getSigners();
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  
  console.log("\n=== DEBUG INFO ===\n");
  console.log("Deployer TKA:", ethers.formatEther(await tokenA.balanceOf(deployer.address)));
  console.log("Deployer TKB:", ethers.formatEther(await tokenB.balanceOf(deployer.address)));
  console.log("Pool TKA:", ethers.formatEther(await tokenA.balanceOf(poolAddr)));
  console.log("Pool TKB:", ethers.formatEther(await tokenB.balanceOf(poolAddr)));
  console.log("Pool reserve0:", ethers.formatEther(await pool.reserve0()));
  console.log("Pool reserve1:", ethers.formatEther(await pool.reserve1()));
  
  // Check allowance
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Router allowance TKA:", ethers.formatEther(allowance));
  
  // Check if router has pool mapping
  const poolFromRouter = await (await ethers.getContractAt("Router", routerAddr)).getPool(tokenAAddr, tokenBAddr);
  console.log("Pool from Router:", poolFromRouter);
}

main().catch(console.error);
