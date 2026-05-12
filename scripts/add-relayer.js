import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const fspAddr = "0x517dc7Dd278FA654312Ce348b20581C9E3c1161f";
  const relayerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Hardhat test account
  
  const fsp = await ethers.getContractAt("FeeSubsidyPool", fspAddr);
  
  console.log("Adding relayer:", relayerAddress);
  const tx = await fsp.addRelayer(relayerAddress);
  await tx.wait();
  console.log("✅ Relayer added!");
}

main().catch(console.error);
