import { ethers } from "ethers";

async function main() {
    const FORWARDER = "0x83444DDC3015F1382E2a27E291c3B5978B6F6c42";
    
    const forwarderInterface = new ethers.Interface([
        "function execute(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data, bytes signature) external returns (bool)"
    ]);
    
    const callData = forwarderInterface.encodeFunctionData("execute", [
        "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734",
        "0x30BC9f7812aB04e88Be6697622c9603c224C84Bd",
        0,
        200000,
        0,
        "0x",
        "0x"
    ]);
    
    console.log("Encoded callData:", callData);
    console.log("Length:", callData.length);
}

main();
