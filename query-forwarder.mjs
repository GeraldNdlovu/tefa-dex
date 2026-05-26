import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://sepolia.gateway.tenderly.co");
const FORWARDER_ADDRESS = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";

const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    [
        "function eip712Domain() view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"
    ],
    provider
);

async function main() {
    try {
        const domain = await forwarder.eip712Domain();
        console.log("Domain info:");
        console.log("  name:", domain[1]);
        console.log("  version:", domain[2]);
        console.log("  chainId:", domain[3].toString());
        console.log("  verifyingContract:", domain[4]);
    } catch (e) {
        console.log("No eip712Domain function:", e.message);
    }
}

main().catch(console.error);
