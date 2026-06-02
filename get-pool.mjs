import { ethers } from "ethers";

const RPC = "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c";
const ROUTER = "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";

const provider = new ethers.JsonRpcProvider(RPC);
const routerAbi = ["function getPool(address, address) view returns (address)"];
const router = new ethers.Contract(ROUTER, routerAbi, provider);

const pool = await router.getPool(TKA, TKB);
console.log(pool);
