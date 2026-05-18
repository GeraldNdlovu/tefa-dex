import { network } from "hardhat";
async function main() {
  const { ethers } = await network.connect();
  const [signer] = await ethers.getSigners();
  const wallet = await signer.getAddress();
  
  const tokens = {
    "TKA (balance script)": "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f",
    "TKB (balance script)": "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E",
    "TKA (frontend config)": "0x6644F8db48e76c54033D332304F6922aE962eD2C",
    "TKB (frontend config)": "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB",
    "TokenA (deploy-output)": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "TokenB (deploy-output)": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "TokenA (simple-deploy)": "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    "TokenB (simple-deploy)": "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"
  };
  
  console.log("Token Audit for wallet:", wallet, "\n");
  
  for (const [name, addr] of Object.entries(tokens)) {
    try {
      const token = await ethers.getContractAt("MockERC20", addr);
      const symbol = await token.symbol();
      const balance = await token.balanceOf(wallet);
      const code = await ethers.provider.getCode(addr);
      const exists = code !== "0x" ? "✅" : "❌";
      console.log(`${exists} ${name}: ${addr}`);
      console.log(`   Symbol: ${symbol} | Your balance: ${ethers.formatEther(balance)}\n`);
    } catch(e) {
      console.log(`❌ ${name}: ${addr} (error: ${e.reason || e.code || "no contract"})\n`);
    }
  }
}
main();
