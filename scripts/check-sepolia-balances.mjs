import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
  const tokenBAddr = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
  const routerAddr = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  const address = await deployer.getAddress();
  console.log("Your wallet:", address);
  
  const tkaBalance = await tokenA.balanceOf(address);
  const tkbBalance = await tokenB.balanceOf(address);
  console.log("TKA balance:", ethers.formatEther(tkaBalance));
  console.log("TKB balance:", ethers.formatEther(tkbBalance));
  
  const ethBalance = await ethers.provider.getBalance(address);
  console.log("Sepolia ETH balance:", ethers.formatEther(ethBalance));
  
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log("\nPool reserves:");
  console.log("TKA:", ethers.formatEther(reserve0));
  console.log("TKB:", ethers.formatEther(reserve1));
}

main().catch(console.error);
