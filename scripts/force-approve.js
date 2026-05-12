import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  const tokenAAddr = "0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589";
  const routerAddr = "0x8fC8CFB7f7362E44E472c690A6e025B80E406458";
  
  const tokenA = await ethers.getContractAt("MockERC20", tokenAAddr);
  const [deployer] = await ethers.getSigners();
  
  const amount = ethers.parseEther("10000");
  
  console.log("Approving with amount:", ethers.formatEther(amount));
  
  // Try approve with explicit gas limit
  const approveTx = await tokenA.approve(routerAddr, amount, {
    gasLimit: 100000
  });
  console.log("Approve tx hash:", approveTx.hash);
  
  const receipt = await approveTx.wait();
  console.log("Approve status:", receipt.status);
  
  const allowance = await tokenA.allowance(deployer.address, routerAddr);
  console.log("Allowance after approve:", ethers.formatEther(allowance));
  
  // Check if approve event was emitted
  const iface = new ethers.Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ]);
  
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "Approval") {
        console.log("Approval event found:", {
          owner: parsed.args[0],
          spender: parsed.args[1],
          value: ethers.formatEther(parsed.args[2])
        });
      }
    } catch (e) {}
  }
}

main().catch(console.error);
