import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const tkb = new ethers.Contract(TKB, [
    "function balanceOf(address) view returns (uint256)"
  ], provider);
  
  const signers = await hre.ethers.getSigners();
  const address = await signers[0].getAddress();
  const balance = await tkb.balanceOf(address);
  
  console.log("Address:", address);
  console.log("TKB Balance:", ethers.formatEther(balance));
}

main().catch(console.error);
