import hre from "hardhat";

console.log("Available hre properties:", Object.keys(hre));
console.log("hre.ethers exists?", !!hre.ethers);
console.log("hre.network exists?", !!hre.network);
