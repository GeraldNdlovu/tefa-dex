import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const USER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";

const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
  "function nonces(address) view returns (uint256)"
], provider);

const currentNonce = await executor.nonces(USER_ADDRESS);
console.log(`Current on-chain nonce for ${USER_ADDRESS}: ${currentNonce}`);
console.log(`\n💡 Your next swap must use nonce: ${currentNonce}`);
