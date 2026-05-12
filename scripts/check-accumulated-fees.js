import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const feeCollectorAddr = "0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb";
  const routerAddr = "0x4631BCAbD6dF18D94796344963cB60d44a4136b6";
  const tokenAAddr = "0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9";
  const tokenBAddr = "0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff";
  const treasuryAddr = "0x1c85638e118b37167e9298c2268758e058DdfDA0";
  const fspAddr = "0xC9a43158891282A2B1475592D5719c001986Aaec";
  
  const router = await ethers.getContractAt("Router", routerAddr);
  const poolAddr = await router.getPool(tokenAAddr, tokenBAddr);
  const feeCollector = await ethers.getContractAt("FeeCollector", feeCollectorAddr);
  
  console.log("\n📊 FEE COLLECTOR STATUS\n");
  console.log(`Pool Address: ${poolAddr}`);
  
  try {
    const accumulated = await feeCollector.accumulatedFees(poolAddr);
    console.log(`Accumulated fees in pool: ${ethers.formatEther(accumulated)} TKA`);
  } catch (e) {
    console.log("No accumulated fees yet");
  }
  
  const treasuryBal = await ethers.provider.getBalance(treasuryAddr);
  const fspBal = await ethers.provider.getBalance(fspAddr);
  
  console.log(`\nTreasury ETH: ${ethers.formatEther(treasuryBal)}`);
  console.log(`FSP ETH: ${ethers.formatEther(fspBal)}`);
  
  const split = await feeCollector.getSplit();
  console.log(`\nFee Split: ${Number(split[0])/100}% / ${Number(split[1])/100}% / ${Number(split[2])/100}% / ${Number(split[3])/100}%`);
}

main().catch(console.error);
