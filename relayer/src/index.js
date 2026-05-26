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
        "function execute(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes calldata data, bytes calldata signature) external returns (bool)",
        "function getNonce(address from) view returns (uint256)"
    ],
    relayerWallet
);

// EIP‑712 domain – must match your forwarder’s domain separator
const domain = {
    name: 'TrustedForwarder',
    version: '1',
    chainId: 11155111, // Sepolia
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

// Per‑user queue (in‑memory, fine for one instance)
const userQueues = new Map();
const processingUsers = new Set();

async function processQueue(user) {
    if (processingUsers.has(user)) return;
    processingUsers.add(user);

    const queue = userQueues.get(user);
    if (!queue || queue.length === 0) {
        processingUsers.delete(user);
        return;
    }

    // Take the first pending request
    const { req, res } = queue[0];
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            // 1. Fetch fresh nonce
            const freshNonce = await forwarder.getNonce(req.from);
            console.log(`   Attempt ${attempts} – fresh nonce: ${freshNonce}`);

            // 2. Estimate gas (ignore client’s gas value)
            const gasEstimate = await forwarder.execute.estimateGas(
                req.from, req.to, req.value, req.gas, freshNonce, req.data, req.signature
            );
            const gasLimit = (gasEstimate * 120n) / 100n; // +20% buffer

            // 3. Submit transaction
            const tx = await forwarder.execute(
                req.from, req.to, req.value, req.gas, freshNonce, req.data, req.signature,
                { gasLimit }
            );
            console.log(`   Tx hash: ${tx.hash}`);

            // 4. Wait for confirmation
            const receipt = await tx.wait(1);
            if (receipt.status === 0) throw new Error("Transaction reverted on-chain");

            // 5. Success – remove from queue and respond
            userQueues.get(user).shift();
            res.json({ success: true, txHash: tx.hash });
            processingUsers.delete(user);
            return;

        } catch (error) {
            console.error(`   Attempt ${attempts} failed:`, error.message);

            // Retry on nonce mismatch or dropped transaction
            if (error.message.includes("Invalid nonce") || error.code === 'TRANSACTION_REPLACED') {
                console.log(`   🔄 Retrying with fresh nonce...`);
                continue;
            }

            // Permanent error – remove request and respond with error
            userQueues.get(user).shift();
            res.status(500).json({ error: error.message });
            processingUsers.delete(user);
            return;
        }
    }

    // Max attempts exceeded
    userQueues.get(user).shift();
    res.status(409).json({ error: "Max retries exceeded – please re‑sign" });
    processingUsers.delete(user);
}

app.post('/relay', async (req, res) => {
    const { from, to, value, gas, nonce, data, signature } = req.body;

    console.log(`\n📨 Relay request from ${from} (client nonce: ${nonce})`);

    // Basic validation
    if (!from || !to || !data || !signature) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify signature off‑chain before queuing
    try {
        const recovered = ethers.verifyTypedData(domain, types, {
            from, to, value, gas, nonce, data
        }, signature);
        if (recovered.toLowerCase() !== from.toLowerCase()) {
            return res.status(400).json({ error: "Invalid signature" });
        }
    } catch (err) {
        return res.status(400).json({ error: "Signature verification failed" });
    }

    // Add to queue
    if (!userQueues.has(from)) userQueues.set(from, []);
    userQueues.get(from).push({ req: { from, to, value, gas, nonce, data, signature }, res });

    // Start processing this user's queue
    processQueue(from);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Relayer Running on port ${PORT}`);
    console.log(`   Forwarder: ${FORWARDER_ADDRESS}`);
});
