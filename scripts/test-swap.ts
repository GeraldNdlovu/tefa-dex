import { network } from "hardhat";

async function main() {
  // Connect to the network and get ethers
  const { ethers } = await network.connect();
  
  // Your addresses from deployment
  const routerAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenAAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const tokenBAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  console.log("Getting contracts...");
  console.log("ethers available?", !!ethers);
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const balance = await tokenA.balanceOf(deployer.address);
  console.log("TKA Balance:", ethers.formatEther(balance));
  
  console.log("Approving...");
  await tokenA.approve(routerAddr, ethers.parseEther("1"));
  
  console.log("Swapping...");
  const tx = await router.swap(tokenAAddr, tokenBAddr, ethers.parseEther("0.1"));
  await tx.wait();
  
  console.log("✅ SWAP SUCCESSFUL!");
}

main().catch(console.error);
