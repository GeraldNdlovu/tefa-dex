"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configuration
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = process.env.RPC_URL || "https://rpc.sepolia.org";
const FSP_ADDRESS = process.env.FSP_ADDRESS || "0x517dc7Dd278FA654312Ce348b20581C9E3c1161f";
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS || "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2";
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS || ""; // Will add later
// ABI for FeeSubsidyPool
const FSP_ABI = [
    "function claimReimbursement(bytes32 txHash, uint256 gasUsed, address user, uint256 tradeValue) external payable",
    "function isRelayer(address) view returns (bool)",
    "function addRelayer(address) external"
];
// ABI for Router
const ROUTER_ABI = [
    "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)"
];
// Connect to blockchain
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const fsp = new ethers_1.ethers.Contract(FSP_ADDRESS, FSP_ABI, wallet);
// Store pending transactions
const pendingTransactions = new Map();
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        address: wallet.address,
        fspAddress: FSP_ADDRESS,
        balance: ethers_1.ethers.formatEther(wallet.provider ? '0' : '0')
    });
});
// Get relayer info
app.get('/info', async (req, res) => {
    try {
        const balance = await provider.getBalance(wallet.address);
        const isRelayer = await fsp.isRelayer(wallet.address);
        res.json({
            address: wallet.address,
            balance: ethers_1.ethers.formatEther(balance),
            isRelayer: isRelayer,
            fspBalance: ethers_1.ethers.formatEther(await provider.getBalance(FSP_ADDRESS))
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Submit a gasless transaction
app.post('/relay', async (req, res) => {
    const { signature, user, tokenIn, tokenOut, amountIn, deadline, nonce } = req.body;
    try {
        console.log(`\n📨 Received relay request from ${user}`);
        console.log(`   Amount: ${amountIn} TKA -> TKB`);
        // Validate inputs
        if (!signature || !user || !tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if user is eligible (simplified for testing)
        // In production, check EligibilityOracle
        // Create the transaction to execute the swap
        const router = new ethers_1.ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);
        const amountInWei = ethers_1.ethers.parseEther(amountIn.toString());
        // Get gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers_1.ethers.parseUnits("1", "gwei");
        // Execute swap directly (will pay gas)
        console.log("   Executing swap...");
        const tx = await router.swap(tokenIn, tokenOut, amountInWei, {
            gasPrice: gasPrice,
            gasLimit: 300000
        });
        console.log(`   Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   Confirmed in block ${receipt.blockNumber}`);
        // Claim reimbursement from FSP
        const gasUsed = receipt.gasUsed;
        const tradeValue = amountInWei;
        console.log("   Claiming reimbursement...");
        const claimTx = await fsp.claimReimbursement(tx.hash, gasUsed, user, tradeValue, { gasPrice: gasPrice, gasLimit: 100000 });
        await claimTx.wait();
        console.log("   Reimbursement claimed!");
        res.json({
            success: true,
            txHash: tx.hash,
            gasUsed: gasUsed.toString(),
            reimbursement: ethers_1.ethers.formatEther(gasUsed * gasPrice)
        });
    }
    catch (error) {
        console.error("❌ Relay failed:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.data || error.reason
        });
    }
});
// Add relayer to FSP (admin only)
app.post('/admin/add-relayer', async (req, res) => {
    const { relayerAddress, adminKey } = req.body;
    // Simple admin check (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const tx = await fsp.addRelayer(relayerAddress);
        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║         🚀 TEFA DEX - GASLESS RELAYER             ║
╠════════════════════════════════════════════════════╣
║  Port: ${PORT}                                       ║
║  Address: ${wallet.address}                         ║
║  FSP: ${FSP_ADDRESS}                               ║
║  Router: ${ROUTER_ADDRESS}                         ║
╚════════════════════════════════════════════════════╝
  `);
});
