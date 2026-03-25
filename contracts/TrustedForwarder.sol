// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustedForwarder {
    mapping(address => bool) public isTrustedForwarder;

    constructor() {
        isTrustedForwarder[msg.sender] = true;
    }

    function verify(address forwarder) external view returns (bool) {
        return isTrustedForwarder[forwarder];
    }
}
