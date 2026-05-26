const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const FORWARDER_ADDRESS = "0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d";
const RELAYER_PK = "0xc3a4a03cb1dc669657cebf74936bc62866c5146ca38e25abba544a4b2d0845a3";
const RPC_URL = "https://sepolia.gateway.tenderly.co";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(RELAYER_PK, provider);

const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    [
        "function nonces(address) view returns (uint256)",
        "function execute(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data, bytes signature) returns (bool)"
    ],
    wallet
);

app.post('/relay', async (req, res) => {
    const { from, to, value, gas, data, signature } = req.body;
    
    // Get the CORRECT nonce from the forwarder
    const correctNonce = await forwarder.nonces(from);
    
    console.log(`\n📨 Relay request from ${from}`);
    console.log(`   Client nonce: ${req.body.nonce}`);
    console.log(`   Correct nonce from contract: ${correctNonce}`);
    
    try {
        const tx = await forwarder.execute(from, to, value, gas, correctNonce, data, signature);
        console.log(`   Tx hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Confirmed`);
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, async () => {
    console.log(`\n🚀 Relayer Running on port 3000`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`   Relayer wallet: ${wallet.address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`   Forwarder: ${FORWARDER_ADDRESS}`);
});
