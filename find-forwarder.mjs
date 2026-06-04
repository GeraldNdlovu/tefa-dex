import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // The router was deployed at this address
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  // Get the deployment transaction to find the constructor arguments
  const txHash = "0x..."; // We need the deployment transaction hash
  
  // Alternative: Check if the router has a public getter for trustedForwarder
  // Try calling it as a public variable instead of a function
  const router = new ethers.Contract(ROUTER, [
    "function trustedForwarder() view returns (address)"
  ], provider);
  
  try {
    const forwarder = await router.trustedForwarder();
    console.log("Forwarder address:", forwarder);
  } catch(e) {
    console.log("Error calling trustedForwarder:", e.message);
  }
}

main().catch(console.error);
