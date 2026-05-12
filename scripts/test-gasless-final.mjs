import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
    const { ethers: hreEthers } = await network.connect();
    const [user] = await hreEthers.getSigners();
    
    const FORWARDER = "0x83444DDC3015F1382E2a27E291c3B5978B6F6c42";
    const TEST_RECEIVER = "0x30BC9f7812aB04e88Be6697622c9603c224C84Bd";
    const userAddress = await user.getAddress();
    
    const forwarder = await hreEthers.getContractAt("TrustedForwarder", FORWARDER);
    const nonce = await forwarder.nonces(userAddress);
    console.log(`\n Current nonce: ${nonce}`);
    
    const receiver = await hreEthers.getContractAt("TestReceiver", TEST_RECEIVER);
    const callData = receiver.interface.encodeFunctionData("setValue", [99]);
    
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
    
    console.log("Signing...");
    const signature = await user.signTypedData(domain, types, message);
    
    console.log("Sending to relayer...");
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
        console.log(`✅ Success! Tx hash: ${result.txHash}`);
        const newValue = await receiver.getValue();
        console.log(`Receiver value is now: ${newValue}`);
    } else {
        console.log(`❌ Failed: ${result.error}`);
    }
}

main().catch(console.error);
