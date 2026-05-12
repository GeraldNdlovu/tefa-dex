import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0xAe120F0df055428E45b264E7794A18c54a2a3fAF";
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const name = await tokenA.name();
  const symbol = await tokenA.symbol();
  const balance = await tokenA.balanceOf(deployer.address);
  
  console.log("Token name:", name);
  console.log("Token symbol:", symbol);
  console.log("Deployer balance:", ethers.formatEther(balance));
}

main().catch(console.error);
