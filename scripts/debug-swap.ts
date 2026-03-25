import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  
  console.log("=== STARTING DEBUG ===\n");

  // YOUR ADDRESSES
  const routerAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenAAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const tokenBAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const poolAddr = "0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81";

  console.log("1. Getting signer...");
  const [deployer] = await ethers.getSigners();
  console.log("   Deployer:", deployer.address);

  console.log("\n2. Getting contracts...");
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const pool = await ethers.getContractAt("Pool", poolAddr);
  console.log("   ✅ Contracts loaded");

  console.log("\n3. Checking balances...");
  const tkaBalance = await tokenA.balanceOf(deployer.address);
  const tkbBalance = await tokenB.balanceOf(deployer.address);
  console.log("   TKA:", ethers.formatEther(tkaBalance));
  console.log("   TKB:", ethers.formatEther(tkbBalance));

  console.log("\n4. Checking pool reserves...");
  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  console.log("   Reserve0:", ethers.formatEther(reserve0));
  console.log("   Reserve1:", ethers.formatEther(reserve1));

  console.log("\n5. Checking pool token balances...");
  const poolTKA = await tokenA.balanceOf(poolAddr);
  const poolTKB = await tokenB.balanceOf(poolAddr);
  console.log("   Pool TKA:", ethers.formatEther(poolTKA));
  console.log("   Pool TKB:", ethers.formatEther(poolTKB));

  console.log("\n6. Checking allowance...");
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("   Router allowance:", ethers.formatEther(allowance));

  console.log("\n7. Testing small swap...");
  const amountIn = ethers.parseEther("0.1");
  console.log("   Amount to swap:", ethers.formatEther(amountIn));

  if (allowance < amountIn) {
    console.log("   Approving router...");
    const approveTx = await tokenA.approve(routerAddr, amountIn);
    await approveTx.wait();
    console.log("   ✅ Approved");
  }

  try {
    console.log("   Executing swap...");
    const tx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
    console.log("   ✅ Transaction sent! Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("   ✅ Swap successful! Gas used:", receipt.gasUsed.toString());
  } catch (error: any) {
    console.log("   ❌ Swap failed!");
    console.log("   Error:", error.message);
    if (error.data) console.log("   Data:", error.data);
  }

  console.log("\n=== DEBUG COMPLETE ===");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
