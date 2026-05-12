import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x56D13Eb21a625EdA8438F55DF2C31dC3632034f5";
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("TKA balance:", ethers.formatEther(balance));
  
  const symbol = await tokenA.symbol();
  const name = await tokenA.name();
  console.log("Token:", name, "(", symbol, ")");
}

main().catch(console.error);
