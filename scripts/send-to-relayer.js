import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const [sender] = await ethers.getSigners();
  const relayerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  console.log("Sender address:", sender.address);
  console.log("Sender balance:", ethers.formatEther(await ethers.provider.getBalance(sender.address)));
  
  const amount = ethers.parseEther("0.5");
  
  console.log(`\nSending ${ethers.formatEther(amount)} ETH to relayer...`);
  const tx = await sender.sendTransaction({ to: relayerAddr, value: amount });
  await tx.wait();
  
  console.log("✅ Sent!");
  console.log("Transaction:", tx.hash);
  
  const newBalance = await ethers.provider.getBalance(relayerAddr);
  console.log("Relayer balance now:", ethers.formatEther(newBalance));
}

main().catch(console.error);
