import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c");
const USER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";
const EXECUTOR_ADDRESS = "0x680267D37fd7Ed6E075Ce1148dA2ea27015D5614";
const TOKEN_IN = "0xe64F6E38F004eDE64756dd62d4F10Ce28721e155";

const token = new ethers.Contract(TOKEN_IN, [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
], provider);

const allowance = await token.allowance(USER_ADDRESS, EXECUTOR_ADDRESS);
const balance = await token.balanceOf(USER_ADDRESS);

console.log("TKA Balance:", ethers.formatEther(balance));
console.log("Allowance to Executor:", ethers.formatEther(allowance));

if (allowance < ethers.parseEther("1")) {
  console.log("\n❌ Allowance too low! Need to approve more.");
  console.log(`Run: await token.approve("${EXECUTOR_ADDRESS}", ethers.parseEther("1000"))`);
} else {
  console.log("\n✅ Allowance is sufficient");
}
