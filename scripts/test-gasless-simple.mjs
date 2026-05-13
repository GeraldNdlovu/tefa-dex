import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
    const { ethers: hreEthers } = await network.connect();
    const [user] = await hreEthers.getSigners();
    
    const FORWARDER = "0x8cF91bAc29D8E6449EE036093C3EB73158b41E0C";
    const TEST_RECEIVER = "0x30BC9f7812aB04e88Be6697622c9603c224C84Bd";
    const userAddress = await user.getAddress();
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 TESTING SIMPLE GASLESS CALL");
    console.log("=".repeat(60));
    
    // 1. Create call data for setValue(42)
    const receiver = await hreEthers.getContractAt("TestReceiver", TEST_RECEIVER);
    const callData = receiver.interface.encodeFunctionData("setValue", [42]);
    
    // 2. Get nonce
    const forwarder = await hreEthers.getContractAt("TrustedForwarder", FORWARDER);
    const nonce = await forwarder.nonces(userAddress);
    console.log(`\n1️⃣ Nonce: ${nonce.toString()}`);
    
    // 3. Create EIP-712 typed data
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
        to: TEST_RECEIVER,
        value: 0,
        gas: 200000,
        nonce: nonce,
        data: callData
    };
    
    // 4. Sign
    console.log("2️⃣ Signing meta-transaction...");
    const signature = await user.signTypedData(domain, types, message);
    console.log("   ✅ Signature created");
    
    // 5. Send to relayer
    console.log("\n3️⃣ Sending to relayer...");
    const response = await fetch("http://localhost:3000/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            from: message.from,
            to: message.to,
            value: message.value.toString(),
            gas: message.gas.toString(),
            nonce: message.nonce.toString(),
            data: message.data,
            signature: signature
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        console.log(`   ✅ Transaction submitted!`);
        console.log(`   Tx Hash: ${result.txHash}`);
        
        // Check the value was set
        const valueSet = await receiver.getValue();
        console.log(`\n4️⃣ Result: value = ${valueSet.toString()}`);
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST COMPLETE");
    console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
