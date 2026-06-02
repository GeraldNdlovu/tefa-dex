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
        "function getNonce(address from) view returns (uint256)",
        "function execute(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data, bytes signature) external returns (bool)"
    ],
    relayerWallet
);

const domain = {
    name: 'SimpleForwarder',
    version: '1',
    chainId: 11155111,
    verifyingContract: FORWARDER_ADDRESS
};

const types = {
    ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' }
    ]
};

app.post('/relay', async (req, res) => {
    const { from, to, value, gas, nonce, data, signature } = req.body;
    
    if (!from || !to || !data || !signature) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
        const recovered = ethers.verifyTypedData(domain, types, {
            from, to, value, gas, nonce, data
        }, signature);
        if (recovered.toLowerCase() !== from.toLowerCase()) {
            return res.status(400).json({ error: "Invalid signature" });
        }
        
        const freshNonce = await forwarder.getNonce(from);
        if (freshNonce !== nonce) {
            return res.status(400).json({ error: "Invalid nonce" });
        }
        
        const tx = await forwarder.execute(from, to, value, gas, nonce, data, signature);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error(error);
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
