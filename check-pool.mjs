import { ethers } from "ethers";

const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const POOL = "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4";

const provider = new ethers.JsonRpcProvider(RPC);

// Try different reserve getters
const reserveAbi1 = ["function getReserves() view returns (uint256, uint256)"];
const reserveAbi2 = ["function reserve0() view returns (uint256)", "function reserve1() view returns (uint256)"];

try {
  const pool1 = new ethers.Contract(POOL, reserveAbi1, provider);
  const reserves = await pool1.getReserves();
  console.log("getReserves():", reserves[0].toString(), reserves[1].toString());
} catch(e) {
  console.log("getReserves() failed:", e.message.slice(0, 50));
}

try {
  const pool2 = new ethers.Contract(POOL, reserveAbi2, provider);
  const r0 = await pool2.reserve0();
  const r1 = await pool2.reserve1();
  console.log("reserve0/reserve1():", r0.toString(), r1.toString());
} catch(e) {
  console.log("reserve0() failed:", e.message.slice(0, 50));
}
