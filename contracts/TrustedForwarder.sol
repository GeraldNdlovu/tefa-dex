// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustedForwarder {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function forward(address target, bytes calldata data) external returns (bytes memory) {
        (bool success, bytes memory result) = target.call(data);
        require(success, "Forward failed");
        return result;
    }
}
