import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
    const { ethers: hreEthers } = await network.connect();
    const [user] = await hreEthers.getSigners();
    
    const GASLESS_ROUTER = "0x373560Acbb6cF65A2E265641e82Ec80998c6a843";
    const FORWARDER = "0x8cF91bAc29D8E6449EE036093C3EB73158b41E0C";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    
    const userAddress = await user.getAddress();
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 SENDING GASLESS SWAP TO RELAYER");
    console.log("=".repeat(60));
    
    // 1. Approve router
    console.log("\n1️⃣ Approving Gasless Router...");
    const tokenA = await hreEthers.getContractAt("MockERC20", TKA);
    const approveTx = await tokenA.approve(GASLESS_ROUTER, ethers.parseEther("1"));
    await approveTx.wait();
    console.log("   ✅ Router approved");
    
    // 2. Create swap data
    const router = await hreEthers.getContractAt("Router", GASLESS_ROUTER);
    const swapData = router.interface.encodeFunctionData("swap", [TKA, TKB, ethers.parseEther("1")]);
    
    // 3. Get nonce from forwarder
    const forwarder = await hreEthers.getContractAt("TrustedForwarder", FORWARDER);
    const nonce = await forwarder.nonces(userAddress);
    console.log(`\n2️⃣ Nonce: ${nonce.toString()}`);
    
    // 4. Create EIP-712 typed data
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
        to: GASLESS_ROUTER,
        value: 0,
        gas: 500000,
        nonce: nonce,
        data: swapData
    };
    
    // 5. User signs (no gas cost)
    console.log("\n3️⃣ Signing meta-transaction (gas-free)...");
    const signature = await user.signTypedData(domain, types, message);
    console.log("   ✅ Signature created");
    
    // 6. Send to relayer
    console.log("\n4️⃣ Sending to relayer...");
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
        console.log(`   Block: ${result.blockNumber}`);
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
    }
    
    // 7. Check balance
    const balanceAfter = await tokenA.balanceOf(userAddress);
    console.log(`\n5️⃣ Result:`);
    console.log(`   TKA balance: ${ethers.formatEther(balanceAfter)}`);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ GASLESS SWAP SENT TO RELAYER!");
    console.log("   User paid 0 gas");
    console.log("   Relayer paid gas and will be reimbursed");
    console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
