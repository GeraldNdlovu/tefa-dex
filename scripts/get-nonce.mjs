import { ethers } from "ethers";

const RPC_URL = "https://sepolia.gateway.tenderly.co";
const FORWARDER_ADDRESS = "0x12EA33a8932a5e1eF6Ea68A099B6ea8a32dede96";
const USER_ADDRESS = "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    ["function getNonce(address user) view returns (uint256)"],
    provider
);

const nonce = await forwarder.getNonce(USER_ADDRESS);
console.log("User nonce:", nonce.toString());
