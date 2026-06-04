import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const tkb = new ethers.Contract(TKB, [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)"
  ], provider);
  
  const name = await tkb.name();
  const symbol = await tkb.symbol();
  const decimals = await tkb.decimals();
  
  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Decimals:", decimals);
}

main().catch(console.error);
