// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract SenderTester is ERC2771Context {
    address public lastSender;
    
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}
    
    function test() external {
        lastSender = _msgSender();
    }
    
    function getLastSender() external view returns (address) {
        return lastSender;
    }
}
