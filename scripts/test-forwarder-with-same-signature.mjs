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
    
    const receiver = await hreEthers.getContractAt("TestReceiver", TEST_RECEIVER);
    const callData = receiver.interface.encodeFunctionData("setValue", [42]);
    
    // Create domain with the exact structure your test script uses
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
    
    console.log("\nSigning with the same method as test script...");
    const signature = await user.signTypedData(domain, types, message);
    console.log("Signature length:", signature.length);
    
    console.log("\nCalling forwarder.execute...");
    const tx = await forwarder.execute(
        message.from,
        message.to,
        message.value,
        message.gas,
        message.nonce,
        message.data,
        signature,
        { gasLimit: 500000 }
    );
    
    console.log(`✅ Success! Tx hash: ${tx.hash}`);
    await tx.wait();
    console.log(`Receiver value: ${await receiver.getValue()}`);
}

main().catch(console.error);
