import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const routerAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenBAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  const token = await ethers.getContractAt("MockERC20", tokenAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer:", deployer.address);
  
  // Check current allowance
  const allowance = await token.allowance(deployer.address, routerAddr);
  console.log("Current allowance:", ethers.formatEther(allowance));
  
  if (allowance < ethers.parseEther("10000")) {
    console.log("Approving router to spend 10000 TKA...");
    const approveTx = await token.approve(routerAddr, ethers.parseEther("10000"));
    await approveTx.wait();
    console.log("✅ Approval successful!");
  }
  
  // Check balance
  const balance = await token.balanceOf(deployer.address);
  console.log("TKA Balance:", ethers.formatEther(balance));
  
  // Try swap
  console.log("\nAttempting swap of 10 TKA...");
  const amountIn = ethers.parseEther("10");
  const swapTx = await router.swap(tokenAddr, tokenBAddr, amountIn);
  await swapTx.wait();
  console.log("✅ Swap successful!");
}

main().catch(console.error);
