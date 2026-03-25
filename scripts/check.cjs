async function main() {
  const { ethers } = require("hardhat");
  
  console.log("=== CHECKING DEX STATUS ===\n");
  
  // Your deployed addresses
  const routerAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenAAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const tokenBAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const tokenB = await ethers.getContractAt("MockERC20", tokenBAddr);
  const [deployer] = await ethers.getSigners();
  
  console.log("1. Deployer:", deployer.address);
  
  const tkaBalance = await tokenA.balanceOf(deployer.address);
  const tkbBalance = await tokenB.balanceOf(deployer.address);
  console.log("2. Your TKA balance:", ethers.formatEther(tkaBalance));
  console.log("3. Your TKB balance:", ethers.formatEther(tkbBalance));
  
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  console.log("4. Pool address:", poolAddr);
  
  if (poolAddr !== "0x0000000000000000000000000000000000000000") {
    const pool = await ethers.getContractAt("Pool", poolAddr);
    const reserve0 = await pool.reserve0();
    const reserve1 = await pool.reserve1();
    console.log("5. Pool reserves - TokenA:", ethers.formatEther(reserve0));
    console.log("6. Pool reserves - TokenB:", ethers.formatEther(reserve1));
    
    // Check if pool has tokens
    const poolTKA = await tokenA.balanceOf(poolAddr);
    const poolTKB = await tokenB.balanceOf(poolAddr);
    console.log("7. Pool actual TKA:", ethers.formatEther(poolTKA));
    console.log("8. Pool actual TKB:", ethers.formatEther(poolTKB));
    
    if (reserve0.toString() === "0") {
      console.log("\n⚠️ POOL IS EMPTY! Liquidity wasn't added.");
    } else {
      console.log("\n✅ Pool has liquidity. Ready to swap!");
      
      // Try a small swap
      const amountIn = ethers.parseEther("0.01");
      const allowance = await tokenA.allowance(deployer.address, routerAddr);
      console.log(`\n9. Router allowance: ${ethers.formatEther(allowance)} TKA`);
      
      if (allowance < amountIn) {
        console.log("10. Approving router...");
        const approveTx = await tokenA.approve(routerAddr, amountIn);
        await approveTx.wait();
        console.log("   Approved!");
      }
      
      console.log("11. Attempting swap of 0.01 TKA...");
      try {
        const tx = await router.swap(tokenAAddr, tokenBAddr, amountIn);
        await tx.wait();
        console.log("   ✅ SWAP SUCCESSFUL!");
      } catch (err) {
        console.log("   ❌ Swap failed:", err.message);
      }
    }
  } else {
    console.log("❌ Pool not found! Run deploy script first.");
  }
}

main().catch(console.error);
