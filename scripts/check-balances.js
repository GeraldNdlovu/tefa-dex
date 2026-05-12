import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // Use the addresses from your latest deployment
  const treasuryAddr = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
  const fspAddr = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
  const feeCollectorAddr = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  
  const treasuryBal = await ethers.provider.getBalance(treasuryAddr);
  const fspBal = await ethers.provider.getBalance(fspAddr);
  const feeCollectorBal = await ethers.provider.getBalance(feeCollectorAddr);
  
  console.log("\n📊 REVENUE BALANCES:");
  console.log(`   Treasury:     ${ethers.formatEther(treasuryBal)} ETH`);
  console.log(`   FeeCollector: ${ethers.formatEther(feeCollectorBal)} ETH`);
  console.log(`   FSP:          ${ethers.formatEther(fspBal)} ETH`);
  
  // Check fee collector split
  const feeCollector = await ethers.getContractAt("FeeCollector", feeCollectorAddr);
  const split = await feeCollector.getSplit();
  console.log(`\n📊 Fee Split:`);
  console.log(`   LP:       ${Number(split[0]) / 100}%`);
  console.log(`   Treasury: ${Number(split[1]) / 100}%`);
  console.log(`   Stakers:  ${Number(split[2]) / 100}%`);
  console.log(`   FSP:      ${Number(split[3]) / 100}%`);
}

main().catch(console.error);
