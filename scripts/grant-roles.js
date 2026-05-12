import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const deployer = (await ethers.getSigners())[0];
  const fspAddr = "0x517dc7Dd278FA654312Ce348b20581C9E3c1161f";
  
  const fsp = await ethers.getContractAt("FeeSubsidyPool", fspAddr);
  
  console.log("Deployer:", deployer.address);
  
  // Get roles
  const RELAYER_ROLE = await fsp.RELAYER_ROLE();
  const KEEPER_ROLE = await fsp.KEEPER_ROLE();
  
  console.log("\nGranting RELAYER_ROLE...");
  try {
    const tx1 = await fsp.grantRole(RELAYER_ROLE, deployer.address);
    await tx1.wait();
    console.log("✅ RELAYER_ROLE granted");
  } catch (e) {
    console.log("RELAYER_ROLE error:", e.message);
  }
  
  console.log("\nGranting KEEPER_ROLE...");
  try {
    const tx2 = await fsp.grantRole(KEEPER_ROLE, deployer.address);
    await tx2.wait();
    console.log("✅ KEEPER_ROLE granted");
  } catch (e) {
    console.log("KEEPER_ROLE error:", e.message);
  }
  
  // Check pool state
  const state = await fsp.currentState();
  console.log("\nPool state:", state);
  
  const balance = await ethers.provider.getBalance(fspAddr);
  console.log("FSP balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
