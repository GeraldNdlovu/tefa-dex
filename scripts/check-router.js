import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const routerAddr = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
  const router = await ethers.getContractAt("Router", routerAddr);
  
  console.log("Router address:", router.address);
  
  // Check if router has the swap function
  try {
    const swapABI = router.interface.getFunction("swap");
    console.log("Swap function exists:", !!swapABI);
  } catch (e) {
    console.log("Swap function not found");
  }
}

main().catch(console.error);

