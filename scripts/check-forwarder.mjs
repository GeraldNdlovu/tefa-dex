import { network } from "hardhat";
async function main() {
  const { ethers } = await network.connect();
  const addr = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
  const code = await ethers.provider.getCode(addr);
  if (code !== "0x") {
    console.log("✅ Forwarder exists at:", addr);
    const forwarder = await ethers.getContractAt("TrustedForwarder", addr);
    console.log("Code length:", code.length);
  } else {
    console.log("❌ No contract at:", addr);
  }
}
main();
