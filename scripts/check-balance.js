import { ethers } from "ethers";

const INFURA_API_KEY = "7cc54e6c6a2146b1963a922ab3ce5b0c"; // Replace with your key

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`);
const address = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";

const balance = await provider.getBalance(address);
console.log("Balance (ETH):", ethers.formatEther(balance));
