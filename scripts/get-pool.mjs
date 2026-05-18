import { network } from "hardhat";
async function main() {
  const { ethers } = await network.connect();
  const router = await ethers.getContractAt("Router", "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2");
  const pool = await router.getPool("0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f", "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E");
  console.log("Pool:", pool);
}
main();
