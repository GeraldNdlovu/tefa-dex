import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const FORWARDER = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
    
    // Deploy tester
    const Tester = await ethers.getContractFactory("SenderTester");
    const tester = await Tester.deploy(FORWARDER);
    await tester.waitForDeployment();
    const testerAddr = await tester.getAddress();
    console.log("Tester deployed at:", testerAddr);
    
    // Test direct call
    await tester.test();
    let sender = await tester.getLastSender();
    console.log("Direct call - _msgSender():", sender);
    console.log("Expected (user):", userAddress);
    
    // Test via forwarder
    const forwarder = await ethers.getContractAt("TrustedForwarder", FORWARDER);
    const callData = tester.interface.encodeFunctionData("test");
    const nonce = await forwarder.nonces(userAddress);
    
    const domain = {
        name: "TrustedForwarder",
        version: "1",
        chainId: 31337,
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
        to: testerAddr,
        value: 0,
        gas: 200000,
        nonce: nonce,
        data: callData
    };
    
    const signature = await user.signTypedData(domain, types, message);
    
    console.log("\nCalling via Forwarder...");
    const tx = await forwarder.execute(
        message.from,
        message.to,
        message.value,
        message.gas,
        message.nonce,
        message.data,
        signature
    );
    await tx.wait();
    
    sender = await tester.getLastSender();
    console.log("Via Forwarder - _msgSender():", sender);
    console.log("Expected (user):", userAddress);
    console.log("Match:", sender.toLowerCase() === userAddress.toLowerCase());
}

main().catch(console.error);
