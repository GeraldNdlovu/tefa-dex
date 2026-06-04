import hre from "hardhat";

async function main() {
    const ROUTER = "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B";
    const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";

    const router = await hre.ethers.getContractAt("Router", ROUTER);

    const pool = await router.getPool(TKA, TKB);

    console.log("Pool address:", pool);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
