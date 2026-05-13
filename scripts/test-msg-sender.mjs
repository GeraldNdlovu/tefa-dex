import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const FORWARDER = "0xA9fCEd86688FF5c1528600989194fA7AE5c33b1f";
    const GASLESS_ROUTER = "0x76E102EFA0baC7D05Eb04F8DdCbD1bd9C13fB839";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    
    // Create a simple test contract that returns msg.sender
    // But instead, let's create a test contract that logs who is calling
    
    console.log("This requires a test contract. Let me deploy a simple tester...");
    
    const testerCode = `
    contract SenderTester {
        function getSender() external view returns (address) {
            return msg.sender;
        }
    }`;
    
    // Deploy a temporary test contract
    const factory = await ethers.getContractFactory("SenderTester");
    const tester = await factory.deploy();
    await tester.waitForDeployment();
    const testerAddr = await tester.getAddress();
    
    console.log(`Test contract deployed at: ${testerAddr}`);
    
    // Test direct call
    const directSender = await tester.getSender();
    console.log(`\nDirect call sender: ${directSender}`);
    
    // Test through Forwarder
    const forwarder = await ethers.getContractAt("TrustedForwarder", FORWARDER);
    
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
    
    const nonce = await forwarder.nonces(userAddress);
    const callData = tester.interface.encodeFunctionData("getSender");
    
    const message = {
        from: userAddress,
        to: testerAddr,
        value: 0,
        gas: 100000,
        nonce: nonce,
        data: callData
    };
    
    const signature = await user.signTypedData(domain, types, message);
    
    console.log("\nCalling through Forwarder...");
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
    await tx.wait();
    
    // The Forwarder doesn't return the result, so we need another approach
    console.log("Transaction executed. Check Forwarder events for revert.");
}

main().catch(console.error);
