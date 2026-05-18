import { network } from "hardhat";
async function main() {
  const { ethers } = await network.connect();
  const router = await ethers.getContractAt("Router", "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2");
  const candidates = [
    "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  ];
  for (const addr of candidates) {
    const result = await router.isTrustedForwarder(addr);
    if (result) console.log("✅ Forwarder:", addr);
    else console.log("❌ Not forwarder:", addr);
  }
}
main();
