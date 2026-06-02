require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const FSP_ADDRESS = process.env.FSP_ADDRESS;
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;

if (!PRIVATE_KEY || !RPC_URL || !FSP_ADDRESS || !ROUTER_ADDRESS) {
  console.error("Missing configuration!");
  process.exit(1);
}

const FSP_ABI = [
  "function claimReimbursement(bytes32 txHash, uint256 gasUsed, address user, uint256 tradeValue) external",
  "function isRelayer(address) view returns (bool)"
];

const ROUTER_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

app.get('/health', async (req, res) => {
  const balance = await provider.getBalance(wallet.address);
  res.json({
    status: 'ok',
    relayerAddress: wallet.address,
    balance: ethers.formatEther(balance),
    fspAddress: FSP_ADDRESS,
    routerAddress: ROUTER_ADDRESS
  });
});

app.post('/relay', async (req, res) => {
  const { user, tokenIn, tokenOut, amountIn } = req.body;
  
  console.log(`\n📨 Relay request from ${user}`);
  console.log(`   Amount: ${amountIn}`);
  
  try {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);
    const amountInWei = ethers.parseEther(amountIn.toString());
    const gasPrice = (await provider.getFeeData()).gasPrice || ethers.parseUnits("2", "gwei");
    
    console.log("   Executing swap...");
    const swapTx = await router.swap(tokenIn, tokenOut, amountInWei, {
      gasLimit: 500000,
      gasPrice: gasPrice
    });
    
    console.log(`   TX sent: ${swapTx.hash}`);
    const receipt = await swapTx.wait();
    console.log(`   Gas used: ${receipt.gasUsed}`);
    
    const fsp = new ethers.Contract(FSP_ADDRESS, FSP_ABI, wallet);
    console.log("   Claiming reimbursement...");
    const claimTx = await fsp.claimReimbursement(
      receipt.hash,
      receipt.gasUsed,
      user,
      amountInWei,
      { gasLimit: 200000, gasPrice: gasPrice }
    );
    await claimTx.wait();
    console.log("   ✅ Done!");
    
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    console.error("   ❌ Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Relayer running on port ${PORT}`);
  console.log(`   Address: ${wallet.address}\n`);
});
