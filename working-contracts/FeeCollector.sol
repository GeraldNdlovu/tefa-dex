// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeCollector is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant POOL_ROLE = keccak256("POOL_ROLE");
    
    struct FeeSplit {
        uint16 lp;        // Liquidity Providers (60%)
        uint16 treasury;  // Protocol Treasury (25%)
        uint16 stakers;   // veToken Holders (10%)
        uint16 fsp;       // Fee Subsidy Pool (5%)
    }
    
    FeeSplit public split;
    
    address public treasury;
    address public stakingRewards;
    address public feeSubsidyPool;
    
    mapping(address => uint256) public accumulatedFees;
    mapping(address => uint256) public totalFeesCollected;
    
    event FeesDistributed(
        address indexed pool,
        address indexed token,
        uint256 total,
        uint256 lpAmount,
        uint256 treasuryAmount,
        uint256 stakerAmount,
        uint256 fspAmount
    );
    
    event SplitUpdated(uint16 lp, uint16 treasury, uint16 stakers, uint16 fsp);
    event RolesUpdated(address indexed account, bytes32 indexed role, bool granted);
    
    constructor(
        address _treasury,
        address _stakingRewards,
        address _feeSubsidyPool
    ) {
        require(_treasury != address(0), "Treasury cannot be zero");
        require(_stakingRewards != address(0), "Staking rewards cannot be zero");
        require(_feeSubsidyPool != address(0), "FSP cannot be zero");
        
        treasury = _treasury;
        stakingRewards = _stakingRewards;
        feeSubsidyPool = _feeSubsidyPool;
        
        // Default split: 60% LP / 25% Treasury / 10% Stakers / 5% FSP
        split = FeeSplit(6000, 2500, 1000, 500);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    function distributeFees(
        address pool,
        address token,
        uint256 amount
    ) external nonReentrant onlyRole(POOL_ROLE) {
        require(amount > 0, "No fees to distribute");
        require(pool != address(0), "Invalid pool");
        require(token != address(0), "Invalid token");
        
        uint256 lpAmount = amount * split.lp / 10000;
        uint256 treasuryAmount = amount * split.treasury / 10000;
        uint256 stakerAmount = amount * split.stakers / 10000;
        uint256 fspAmount = amount * split.fsp / 10000;
        
        // LP fees stay in pool (auto-compound via increased reserves)
        accumulatedFees[pool] += lpAmount;
        totalFeesCollected[pool] += amount;
        
        // Transfer to treasury
        if (treasuryAmount > 0 && treasury != address(0)) {
            IERC20(token).transfer(treasury, treasuryAmount);
        }
        
        // Transfer to staking rewards
        if (stakerAmount > 0 && stakingRewards != address(0)) {
            IERC20(token).transfer(stakingRewards, stakerAmount);
        }
        
        // Transfer to Fee Subsidy Pool (for gas subsidies)
        if (fspAmount > 0 && feeSubsidyPool != address(0)) {
            IERC20(token).transfer(feeSubsidyPool, fspAmount);
        }
        
        emit FeesDistributed(pool, token, amount, lpAmount, treasuryAmount, stakerAmount, fspAmount);
    }
    
    function updateSplit(
        uint16 _lp,
        uint16 _treasury,
        uint16 _stakers,
        uint16 _fsp
    ) external onlyRole(GOVERNANCE_ROLE) {
        require(_lp + _treasury + _stakers + _fsp == 10000, "Must sum to 100%");
        split = FeeSplit(_lp, _treasury, _stakers, _fsp);
        emit SplitUpdated(_lp, _treasury, _stakers, _fsp);
    }
    
    function addPoolRole(address pool) external onlyRole(GOVERNANCE_ROLE) {
        grantRole(POOL_ROLE, pool);
        emit RolesUpdated(pool, POOL_ROLE, true);
    }
    
    function getSplit() external view returns (uint16, uint16, uint16, uint16) {
        return (split.lp, split.treasury, split.stakers, split.fsp);
    }
    
    function getAccumulatedFees(address pool) external view returns (uint256) {
        return accumulatedFees[pool];
    }
}
