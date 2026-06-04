import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // Your wallet private key - you need to add it
  const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY_HERE";
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const tkb = new ethers.Contract(TKB, [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ], wallet);
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  const balance = await tkb.balanceOf(wallet.address);
  console.log("Address:", wallet.address);
  console.log("TKB Balance:", ethers.formatEther(balance));
  
  // Check allowance
  const allowance = await tkb.allowance(wallet.address, ROUTER);
  console.log("Current Router Allowance:", ethers.formatEther(allowance));
  
  // If balance > 0 and allowance is low, approve
  if (balance > 0 && allowance < balance) {
    console.log("Approving router to spend TKB...");
    const tx = await tkb.approve(ROUTER, ethers.parseEther("10000"));
    await tx.wait();
    console.log("Approved!");
  }
}

main().catch(console.error);
