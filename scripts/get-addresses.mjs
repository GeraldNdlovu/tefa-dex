import { ethers } from "hardhat";

async function main() {
    // Load your deployed addresses (adjust path as needed)
    const deployments = await import("../deployments.json");
    
    console.log("TKA Address:", deployments.TKA);
    console.log("TKB Address:", deployments.TKB);
    console.log("Router Address:", deployments.Router);
    console.log("Pool Address:", deployments.Pool);
}

main().catch(console.error);
