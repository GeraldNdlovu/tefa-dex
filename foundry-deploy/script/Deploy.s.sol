// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TrustedForwarder.sol";
import "../src/Router.sol";
import "../src/MockERC20.sol";

contract DeployTEFA is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        TrustedForwarder forwarder = new TrustedForwarder();
        console.log("TrustedForwarder:", address(forwarder));
        
        Router router = new Router(address(forwarder));
        console.log("Router:", address(router));
        
        MockERC20 tokenA = new MockERC20("Token A", "TKNA", 18);
        MockERC20 tokenB = new MockERC20("Token B", "TKNB", 18);
        console.log("TokenA:", address(tokenA));
        console.log("TokenB:", address(tokenB));
        
        router.createPool(address(tokenA), address(tokenB));
        console.log("Pool created");

        vm.stopBroadcast();
    }
}
