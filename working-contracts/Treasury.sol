// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    address public feeSubsidyPool;
    uint256 public fspAllocationRate = 700;
    uint256 public epochLength = 7 days;
    uint256 public lastEpochTimestamp;
    
    mapping(address => uint256) public revenueBySource;
    mapping(uint256 => uint256) public epochAllocation;
    
    event RevenueReceived(address indexed source, uint256 amount);
    event FspAllocation(uint256 indexed epoch, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount, string reason);
    
    constructor(address _feeSubsidyPool) {
        require(_feeSubsidyPool != address(0), "FSP cannot be zero");
        feeSubsidyPool = _feeSubsidyPool;
        lastEpochTimestamp = block.timestamp;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }
    
    receive() external payable {
        revenueBySource[msg.sender] += msg.value;
        emit RevenueReceived(msg.sender, msg.value);
    }
    
    function allocateToFSP() internal {
        uint256 totalRevenue = address(this).balance;
        if (totalRevenue == 0) return;
        
        uint256 fspAmount = totalRevenue * fspAllocationRate / 10000;
        
        (bool sent, ) = feeSubsidyPool.call{value: fspAmount}("");
        require(sent, "Transfer failed");
        
        epochAllocation[block.timestamp / epochLength] += fspAmount;
        emit FspAllocation(block.timestamp / epochLength, fspAmount);
    }
    
    function finaliseEpoch() external onlyRole(KEEPER_ROLE) {
        require(block.timestamp >= lastEpochTimestamp + epochLength, "Epoch not ended");
        allocateToFSP();
        lastEpochTimestamp = block.timestamp;
    }
    
    function setFspRate(uint256 rate) external onlyRole(GOVERNANCE_ROLE) {
        require(rate >= 100 && rate <= 2000, "Rate must be 1-20%");
        fspAllocationRate = rate;
    }
}
