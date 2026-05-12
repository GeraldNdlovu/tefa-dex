import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const poolAddr = "0x3838c6D296C855D311572EbD7256527FA982Ff13";
  const tokenAAddr = "0x18E317A7D70d8fBf8e6E893616b52390EbBdb629";
  const tokenBAddr = "0x4b6aB5F819A515382B0dEB6935D793817bB4af28";
  
  console.log("\nChecking contract existence...");
  
  const code = await ethers.provider.getCode(poolAddr);
  console.log("Pool exists:", code !== "0x");
  
  const tokenACode = await ethers.provider.getCode(tokenAAddr);
  console.log("TokenA exists:", tokenACode !== "0x");
  
  const tokenBCode = await ethers.provider.getCode(tokenBAddr);
  console.log("TokenB exists:", tokenBCode !== "0x");
  
  // Try to get token info
  if (tokenACode !== "0x") {
    try {
      const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
      const name = await tokenA.name();
      const symbol = await tokenA.symbol();
      console.log(`TokenA: ${name} (${symbol})`);
    } catch (e) {
      console.log("Error reading TokenA:", e.message);
    }
  }
}

main().catch(console.error);
