import hre from "hardhat";

async function main() {
    const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";

    const tkb = await hre.ethers.getContractAt("IERC20", TKB);
    const [signer] = await hre.ethers.getSigners();

    const balance = await tkb.balanceOf(signer.address);

    console.log("Address:", signer.address);
    console.log("TKB Balance:", hre.ethers.formatEther(balance));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
