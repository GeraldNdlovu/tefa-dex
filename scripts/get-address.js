import { ethers } from "ethers";

const privateKey = "0xc4fa308df2fe8baf409ac497723f15d4f94605acb162e979664bd7154a35965f";
const wallet = new ethers.Wallet(privateKey);
console.log("Your wallet address:", wallet.address);
