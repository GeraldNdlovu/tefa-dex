import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const currentNonce = await ethers.provider.getTransactionCount(wallet, "pending");
  console.log(`Current pending nonce: ${currentNonce}`);
  console.log("\nTo reset, send a 0 ETH transaction with higher gas:");
  console.log(`await signer.sendTransaction({ to: "${wallet}", value: 0, nonce: ${currentNonce}, gasPrice: ethers.parseUnits("50", "gwei") });`);
  
  // Try to send a replacement with higher gas
  const tx = await signer.sendTransaction({
    to: wallet,
    value: 0,
    nonce: currentNonce,
    gasPrice: ethers.parseUnits("50", "gwei"),
    gasLimit: 21000
  });
  console.log(`\nReplacement tx sent: ${tx.hash}`);
  await tx.wait();
  console.log("✅ Nonce cleared");
}
main().catch(console.error);
