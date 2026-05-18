const { ethers } = require("hardhat");
async function main() {
  const router = await ethers.getContractAt("Router", "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2");
  const pool = await router.getPool("0x6644F8db48e76c54033D332304F6922aE962eD2C", "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB");
  console.log("Pool:", pool);
}
main();
