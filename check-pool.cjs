const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(
    "https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c"
  );

  const router = new ethers.Contract(
    "0x48e902bE0E641CBD0AE0699eEE7D76cDAa60203B",
    [
      "function getPool(address,address) view returns(address)"
    ],
    provider
  );

  const TKA = "0x6644F8db48e76c54033D332304F6922aE962eD2C";
  const TKB = "0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB";

  console.log("TKA->TKB pool:", await router.getPool(TKA, TKB));
  console.log("TKB->TKA pool:", await router.getPool(TKB, TKA));
}

main().catch(console.error);
