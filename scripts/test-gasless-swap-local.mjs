import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const FORWARDER = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
    const GASLESS_ROUTER = "0x998abeb3E57409262aE5b751f60747921B33613E";
    const TKA = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";
    const TKB = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 GASLESS SWAP TEST - LOCALHOST");
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
        to: GASLESS_ROUTER,
        value: 0,
        gas: 300000,
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
        console.log("✅ GASLESS SWAP SUCCESSFUL!");
        console.log("   User paid 0 gas");
        console.log("=".repeat(60) + "\n");
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
    }
}

main().catch(console.error);
