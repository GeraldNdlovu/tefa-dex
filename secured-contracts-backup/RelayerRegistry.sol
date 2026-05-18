// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RelayerRegistry is AccessControl {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    struct RelayerInfo {
        address relayer;
        uint256 slashCount;
        uint256 registeredAt;
        bool isActive;
    }
    
    mapping(address => RelayerInfo) public relayers;
    address[] public relayerList;
    
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer, string reason);
    event RelayerSlashed(address indexed relayer, uint256 slashCount, string reason);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    function addRelayer(address relayer) external onlyRole(GOVERNANCE_ROLE) {
        require(!relayers[relayer].isActive, "Already registered");
        
        relayers[relayer] = RelayerInfo({
            relayer: relayer,
            slashCount: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        relayerList.push(relayer);
        
        emit RelayerAdded(relayer);
    }
    
    function removeRelayer(address relayer, string calldata reason) external onlyRole(GOVERNANCE_ROLE) {
        require(relayers[relayer].isActive, "Not registered");
        
        relayers[relayer].isActive = false;
        emit RelayerRemoved(relayer, reason);
    }
    
    function slashRelayer(address relayer, string calldata reason) external onlyRole(GOVERNANCE_ROLE) {
        require(relayers[relayer].isActive, "Not registered");
        
        relayers[relayer].slashCount++;
        emit RelayerSlashed(relayer, relayers[relayer].slashCount, reason);
        
        // Remove after 3 slashes
        if (relayers[relayer].slashCount >= 3) {
            relayers[relayer].isActive = false;
            emit RelayerRemoved(relayer, "Slashed 3 times");
        }
    }
    
    function isRelayer(address account) external view returns (bool) {
        return relayers[account].isActive;
    }
    
    function getActiveRelayers() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < relayerList.length; i++) {
            if (relayers[relayerList[i]].isActive) count++;
        }
        
        address[] memory active = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < relayerList.length; i++) {
            if (relayers[relayerList[i]].isActive) {
                active[index++] = relayerList[i];
            }
        }
        return active;
    }
}
