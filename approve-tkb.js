import { ethers } from "ethers";

const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const PRIVATE_KEY = "0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f";
const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const abi = ["function approve(address spender, uint256 amount) returns (bool)"];
const tkb = new ethers.Contract(TKB, abi, wallet);

console.log("Approving TKB...");
const tx = await tkb.approve(ROUTER, ethers.parseEther("1000000"));
await tx.wait();
console.log("✅ TKB approved! Tx:", tx.hash);
