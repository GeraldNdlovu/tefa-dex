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

    function execute(
        address to,
        bytes memory data,
        bytes memory signature
    ) external returns (bool) {
        require(isTrustedForwarder[msg.sender], "Only trusted forwarder");
        (bool success, ) = to.call(data);
        return success;
    }
}
