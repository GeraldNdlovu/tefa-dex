// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EligibilityOracle is AccessControl {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    struct UserEligibility {
        uint256 totalVolume;
        uint256 tradeCount;
        uint256 firstTradeTime;
        uint256 stakingTier; // 0 = none, 1 = bronze, 2 = silver, 3 = gold
        bool isWhitelisted;
    }
    
    mapping(address => UserEligibility) public users;
    
    uint256 public minTradeSize = 10 ether; // $10 at current prices
    uint256 public volumeThreshold = 500 ether; // $500 volume
    
    event EligibilityUpdated(address indexed user, uint256 volume, uint256 trades);
    event UserWhitelisted(address indexed user);
    event UserBlacklisted(address indexed user);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }
    
    function updateUserVolume(address user, uint256 volumeAdd) external onlyRole(KEEPER_ROLE) {
        users[user].totalVolume += volumeAdd;
        users[user].tradeCount++;
        if (users[user].firstTradeTime == 0) {
            users[user].firstTradeTime = block.timestamp;
        }
        emit EligibilityUpdated(user, users[user].totalVolume, users[user].tradeCount);
    }
    
    function updateStakingTier(address user, uint256 tier) external onlyRole(KEEPER_ROLE) {
        users[user].stakingTier = tier;
    }
    
    function whitelistUser(address user) external onlyRole(GOVERNANCE_ROLE) {
        users[user].isWhitelisted = true;
        emit UserWhitelisted(user);
    }
    
    function blacklistUser(address user) external onlyRole(GOVERNANCE_ROLE) {
        users[user].isWhitelisted = false;
        emit UserBlacklisted(user);
    }
    
    function isEligibleForSubsidy(address user) external view returns (bool) {
        UserEligibility memory u = users[user];
        
        // New users: first 5 trades fully subsidized
        if (u.tradeCount < 5) {
            return true;
        }
        
        // Whitelisted users
        if (u.isWhitelisted) {
            return true;
        }
        
        // Stakers get full subsidy
        if (u.stakingTier > 0) {
            return true;
        }
        
        // Volume threshold: partial subsidy (70% of gas)
        if (u.totalVolume >= volumeThreshold) {
            return true;
        }
        
        return false;
    }
    
    function getSubsidyPercentage(address user) external view returns (uint256) {
        UserEligibility memory u = users[user];
        
        if (u.tradeCount < 5 || u.isWhitelisted || u.stakingTier > 0) {
            return 100; // 100% subsidy
        }
        
        if (u.totalVolume >= volumeThreshold) {
            return 70; // 70% subsidy
        }
        
        return 0; // No subsidy
    }
    
    function setMinTradeSize(uint256 _minTradeSize) external onlyRole(GOVERNANCE_ROLE) {
        minTradeSize = _minTradeSize;
    }
    
    function setVolumeThreshold(uint256 _threshold) external onlyRole(GOVERNANCE_ROLE) {
        volumeThreshold = _threshold;
    }
}
