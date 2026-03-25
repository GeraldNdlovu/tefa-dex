import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();   // ← Hardhat 3 way for scripts

  console.log("✅ ethers loaded successfully");

  const Token = await ethers.getContractFactory("MockERC20");

  const tokenA = await Token.deploy(
    "TokenA",
    "TKA",
    ethers.parseEther("1000")
  );
  await tokenA.waitForDeployment();
  console.log("✅ TokenA deployed to:", await tokenA.getAddress());

  const tokenB = await Token.deploy(
    "TokenB",
    "TKB",
    ethers.parseEther("1000")
  );
  await tokenB.waitForDeployment();
  console.log("✅ TokenB deployed to:", await tokenB.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
