import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const FORWARDER = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
    const GASLESS_ROUTER = "0x1C12AD5634CeBE3073A73E1d79888813D4FAD301";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 GASLESS SWAP TEST - SEPOLIA");
    console.log("=".repeat(60));
    
    const tokenA = await ethers.getContractAt("MockERC20", TKA);
    const balanceBefore = await tokenA.balanceOf(userAddress);
    console.log(`\n TKA balance before: ${ethers.formatEther(balanceBefore)}`);
    
    console.log("\n1️⃣ Approving Gasless Router...");
    const approveTx = await tokenA.approve(GASLESS_ROUTER, ethers.parseEther("1"));
    await approveTx.wait();
    console.log("   ✅ Router approved");
    
    const router = await ethers.getContractAt("Router", GASLESS_ROUTER);
    const swapData = router.interface.encodeFunctionData("swap", [TKA, TKB, ethers.parseEther("1")]);
    
    const forwarder = await ethers.getContractAt("TrustedForwarder", FORWARDER);
    const nonce = await forwarder.nonces(userAddress);
    console.log(`\n2️⃣ Nonce: ${nonce}`);
    
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
    
    console.log("\n3️⃣ Signing meta-transaction (gas-free)...");
    const signature = await user.signTypedData(domain, types, message);
    console.log("   ✅ Signature created");
    
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
        console.log(`   ✅ Swap submitted!`);
        console.log(`   Tx hash: ${result.txHash}`);
        
        const balanceAfter = await tokenA.balanceOf(userAddress);
        console.log(`\n5️⃣ Result:`);
        console.log(`   TKA balance after: ${ethers.formatEther(balanceAfter)}`);
        console.log(`   TKA spent: ${ethers.formatEther(balanceBefore - balanceAfter)}`);
        
        console.log("\n" + "=".repeat(60));
        console.log("✅ GASLESS SWAP SUCCESSFUL ON SEPOLIA!");
        console.log("   User paid 0 gas");
        console.log("=".repeat(60) + "\n");
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
    }
}

main().catch(console.error);
