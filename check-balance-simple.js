import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
  
  // Replace this with your actual wallet address from MetaMask
  const WALLET_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";
  
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
  const tkb = new ethers.Contract(TKB, [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ], provider);
  
  const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
  
  const balance = await tkb.balanceOf(WALLET_ADDRESS);
  console.log("Address:", WALLET_ADDRESS);
  console.log("TKB Balance:", ethers.formatEther(balance));
  
  const allowance = await tkb.allowance(WALLET_ADDRESS, ROUTER);
  console.log("Router Allowance:", ethers.formatEther(allowance));
  
  const pool = "0x49b46fc7076B3C37D9fa54303Eb7312a4Fe6609a";
  const poolContract = new ethers.Contract(pool, [
    "function getReserves() view returns (uint256, uint256)"
  ], provider);
  
  try {
    const reserves = await poolContract.getReserves();
    console.log("Pool Reserves - TKA:", ethers.formatEther(reserves[0]), "TKB:", ethers.formatEther(reserves[1]));
  } catch(e) {
    console.log("Could not fetch reserves:", e.message);
  }
}

main().catch(console.error);
