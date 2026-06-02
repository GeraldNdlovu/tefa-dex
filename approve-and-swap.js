import { ethers } from "ethers";

const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const PRIVATE_KEY = "0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f";
const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const erc20Abi = ["function approve(address spender, uint256 amount) returns (bool)"];
const tkb = new ethers.Contract(TKB, erc20Abi, wallet);

console.log("Approving Router to spend TKB...");
const approveTx = await tkb.approve(ROUTER, ethers.parseEther("1000000"));
await approveTx.wait();
console.log("✅ TKB approved! Now try swapping in the frontend.");
