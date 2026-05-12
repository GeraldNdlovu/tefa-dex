import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL;
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    [
        "function execute(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes calldata data, bytes calldata signature) external returns (bool)"
    ],
    relayerWallet
);

app.post('/relay', async (req, res) => {
    const { from, to, value, gas, nonce, data, signature } = req.body;
    
    console.log(`\n📨 Relay request from ${from}`);
    
    try {
        const tx = await forwarder.execute(from, to, value, gas, nonce, data, signature);
        console.log(`   Tx hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Confirmed`);
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Relayer Running on port ${PORT}`);
    console.log(`   Forwarder: ${FORWARDER_ADDRESS}`);
});
