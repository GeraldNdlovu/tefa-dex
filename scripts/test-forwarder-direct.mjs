import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
    const { ethers: hreEthers } = await network.connect();
    const [user] = await hreEthers.getSigners();
    
    const FORWARDER = "0x8cF91bAc29D8E6449EE036093C3EB73158b41E0C";
    const userAddress = await user.getAddress();
    
    console.log("\n🔍 Testing Forwarder directly...");
    
    const forwarder = await hreEthers.getContractAt("TrustedForwarder", FORWARDER);
    
    // Get nonce
    const nonce = await forwarder.nonces(userAddress);
    console.log(`   Nonce: ${nonce}`);
    
    // Create a simple test message
    const to = userAddress;
    const value = 0;
    const gas = 100000;
    const data = "0x";
    
    const domain = {
        name: "TrustedForwarder",
        version: "1",
        chainId: 11155111,
        verifyingContract: FORWARDER
    };
    
    const types = {
        ForwardRequest: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "gas", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "data", type: "bytes" }
        ]
    };
    
    const message = {
        from: userAddress,
        to: to,
        value: value,
        gas: gas,
        nonce: nonce,
        data: data
    };
    
    console.log("\n   Signing test message...");
    const signature = await user.signTypedData(domain, types, message);
    console.log(`   Signature length: ${signature.length}`);
    
    console.log("\n   Attempting execute...");
    try {
        const tx = await forwarder.execute(
            message.from,
            message.to,
            message.value,
            message.gas,
            message.nonce,
            message.data,
            signature,
            { gasLimit: 200000 }
        );
        console.log(`   ✅ Execute succeeded! Tx hash: ${tx.hash}`);
    } catch (error) {
        console.log(`   ❌ Execute failed: ${error.message}`);
    }
}

main().catch(console.error);
