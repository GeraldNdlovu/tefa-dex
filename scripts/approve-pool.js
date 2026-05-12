import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const tokenBAddr = "0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const router = await ethers.getContractAt("Router", routerAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10");
  
  // Check if pool exists
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("Pool address from router:", poolAddr);
  
  if (poolAddr === "0x0000000000000000000000000000000000000000") {
    console.log("Pool not found! Creating pool...");
    const createPool = await router.createPool(tokenAAddr, tokenBAddr);
    await createPool.wait();
    console.log("Pool created!");
  }
  
  console.log("\nApproving Router...");
  const approve = await tokenA.approve(routerAddr, amount);
  await approve.wait();
  console.log("Router approved!");
  
  console.log("\nTrying swap...");
  try {
    const tx = await router.swapDirect(tokenAAddr, tokenBAddr, amount);
    await tx.wait();
    console.log("✅ Swap successful!");
  } catch (error) {
    console.log("Swap failed:", error.message);
  }
}

main().catch(console.error);
