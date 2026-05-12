// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestReceiver {
    uint256 public value;
    
    function setValue(uint256 newValue) external {
        value = newValue;
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
}
