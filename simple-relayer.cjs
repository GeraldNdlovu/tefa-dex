const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const FORWARDER_ADDRESS = "0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d";
const RELAYER_PK = "0xc3a4a03cb1dc669657cebf74936bc62866c5146ca38e25abba544a4b2d0845a3";
const RPC_URL = "https://sepolia.gateway.tenderly.co";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(RELAYER_PK, provider);

console.log("Relayer wallet:", wallet.address);

// Create forwarder with minimal ABI
const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    [
        "function nonces(address) view returns (uint256)",
        "function execute((address,address,uint256,uint256,uint256,bytes),bytes) returns (bool)"
    ],
    wallet
);

app.post('/relay', async (req, res) => {
    console.log("\n=== RELAY REQUEST RECEIVED ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    
    const { from, to, value, gas, nonce, data, signature } = req.body;
    
    try {
        // Get fresh nonce
        const freshNonce = await forwarder.nonces(from);
        console.log("Fresh nonce:", freshNonce.toString());
        
        // Build request tuple
        const reqTuple = [from, to, value, gas, freshNonce, data];
        
        console.log("Executing forwarder...");
        const tx = await forwarder.execute(reqTuple, signature);
        console.log("Tx hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Confirmed in block:", receipt.blockNumber);
        
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        console.error("ERROR:", err.message);
        if (err.reason) console.error("Reason:", err.reason);
        if (err.data) console.error("Data:", err.data);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Simple relayer running on port 3000");
    console.log("Forwarder:", FORWARDER_ADDRESS);
});
