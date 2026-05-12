import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0xC1e0A9DB9eA830c52603798481045688c8AE99C2";
  const tokenBAddr = "0x683d9CDD3239E0e01E8dC6315fA50AD92aB71D2d";
  const routerAddr = "0x1c9fD50dF7a4f066884b58A05D91e4b55005876A";
  const poolAddr = "0x42128702636909062a0de1B428a378CEb1E07A2d";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const router = await ethers.getContractAt("SimpleRouter", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  // Check allowance
  let allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance before:", ethers.formatEther(allowance));
  
  if (allowance < ethers.parseEther("10000")) {
    console.log("Approving 100,000...");
    const approve = await tokenA.approve(routerAddr, ethers.parseEther("100000"));
    await approve.wait();
    allowance = await tokenA.allowance(deployer.address, routerAddr);
    console.log("Allowance after approve:", ethers.formatEther(allowance));
  }
  
  // Try transferFrom directly to pool
  console.log("\nTrying direct transferFrom from deployer to pool...");
  const amount = ethers.parseEther("1000");
  try {
    const tx = await tokenA.transferFrom(deployer.address, poolAddr, amount);
    await tx.wait();
    console.log("✅ Direct transferFrom succeeded!");
  } catch (error) {
    console.log("Direct transferFrom failed:", error.message);
  }
  
  // Check pool balance
  const poolBalance = await tokenA.balanceOf(poolAddr);
  console.log("Pool TKA balance:", ethers.formatEther(poolBalance));
}

main().catch(console.error);
