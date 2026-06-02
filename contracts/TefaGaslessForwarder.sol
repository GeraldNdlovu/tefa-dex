// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TefaGaslessForwarder is ERC2771Forwarder, Ownable {
    constructor(string memory name) 
        ERC2771Forwarder(name) 
        Ownable(msg.sender) 
    {}
}
