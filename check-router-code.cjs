const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  const routerAddr = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  // Get the bytecode
  const code = await provider.getCode(routerAddr);
  console.log("Router bytecode length:", code.length);
  console.log("Has 0x5e1e6325 (getAmountOut signature):", code.includes("5e1e6325"));
  console.log("Has 0xd5bcb9b5 (swap signature):", code.includes("d5bcb9b5"));
  console.log("Has 0xe6a43905 (getPool signature):", code.includes("e6a43905"));
}

main().catch(console.error);
