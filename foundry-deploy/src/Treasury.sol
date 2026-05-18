// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    address public feeSubsidyPool;
    uint256 public fspAllocationRate = 500; // 5%
    
    event FSPAllocated(uint256 amount);
    event FeeSubsidyPoolSet(address indexed pool);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }
    
    function allocateToFSP(uint256 amount) external nonReentrant {
        require(feeSubsidyPool != address(0), "FSP not set");
        require(amount > 0, "Amount zero");
        require(address(this).balance >= amount, "Insufficient balance");
        
        // Send ETH to FeeSubsidyPool
        (bool success, ) = feeSubsidyPool.call{value: amount}("");
        require(success, "Allocation failed");
        
        emit FSPAllocated(amount);
    }
    
    function setFeeSubsidyPool(address _pool) external onlyRole(GOVERNANCE_ROLE) {
        require(_pool != address(0), "Invalid address");
        feeSubsidyPool = _pool;
        emit FeeSubsidyPoolSet(_pool);
    }
    
    function setFSPRate(uint256 _rate) external onlyRole(GOVERNANCE_ROLE) {
        require(_rate <= 2000, "Rate too high");
        fspAllocationRate = _rate;
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}
