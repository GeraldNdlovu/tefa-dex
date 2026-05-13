import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
    const { ethers: hreEthers } = await network.connect();
    const [user] = await hreEthers.getSigners();
    
    const FORWARDER = "0x83444DDC3015F1382E2a27E291c3B5978B6F6c42";
    const GASLESS_ROUTER = "0x2dddce1A5F81D0f2808e48399103592a57CCA8c6";
    const TKA = "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f";
    const TKB = "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E";
    const userAddress = await user.getAddress();
    
    console.log("\n🔍 DEBUGGING GASLESS SWAP");
    
    // Check allowance
    const tokenA = await hreEthers.getContractAt("MockERC20", TKA);
    const allowance = await tokenA.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance: ${ethers.formatEther(allowance)} TKA`);
    
    // Check Router balance
    const routerBalance = await tokenA.balanceOf(GASLESS_ROUTER);
    console.log(`Router TKA balance: ${ethers.formatEther(routerBalance)}`);
    
    // Try direct swap first (non-gasless) to confirm it works
    const router = await hreEthers.getContractAt("Router", GASLESS_ROUTER);
    console.log("\nTesting direct swap...");
    try {
        const directTx = await router.swap(TKA, TKB, ethers.parseEther("0.1"));
        await directTx.wait();
        console.log("✅ Direct swap successful!");
    } catch (e) {
        console.log("❌ Direct swap failed:", e.message);
    }
    
    // Now test the Forwarder with a simple call
    const forwarder = await hreEthers.getContractAt("TrustedForwarder", FORWARDER);
    const nonce = await forwarder.nonces(userAddress);
    console.log(`\nForwarder nonce: ${nonce}`);
    
    // Create a simple test call to the Router's swap
    const swapData = router.interface.encodeFunctionData("swap", [TKA, TKB, ethers.parseEther("0.1")]);
    
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
    
    console.log("\nSigning meta-transaction...");
    const signature = await user.signTypedData(domain, types, message);
    
    console.log("Calling Forwarder directly...");
    try {
        const tx = await forwarder.execute(
            message.from,
            message.to,
            message.value,
            message.gas,
            message.nonce,
            message.data,
            signature,
            { gasLimit: 600000 }
        );
        console.log(`✅ Forwarder call sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        if (error.revert) {
            console.log(`Revert reason: ${error.revert}`);
        }
    }
}

main().catch(console.error);
