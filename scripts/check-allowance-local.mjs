import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [user] = await ethers.getSigners();
    const userAddress = await user.getAddress();
    
    const GASLESS_ROUTER = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const TKA = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    const token = await ethers.getContractAt("MockERC20", TKA);
    const allowance = await token.allowance(userAddress, GASLESS_ROUTER);
    console.log(`Allowance for Gasless Router: ${ethers.formatEther(allowance)} TKA`);
    
    // Also check if the router has balance
    const routerBalance = await token.balanceOf(GASLESS_ROUTER);
    console.log(`Gasless Router TKA balance: ${ethers.formatEther(routerBalance)} TKA`);
}

main().catch(console.error);
