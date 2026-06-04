import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  const router = new ethers.Contract(ROUTER, [
    "function trustedForwarder() view returns (address)"
  ], provider);
  
  try {
    const forwarder = await router.trustedForwarder();
    console.log("Router's trusted forwarder:", forwarder);
  } catch(e) {
    console.log("Router doesn't have trustedForwarder view function or error:", e.message);
  }
}

main().catch(console.error);
