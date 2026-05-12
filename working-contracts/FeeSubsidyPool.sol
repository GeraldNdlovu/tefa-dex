// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FeeSubsidyPool is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    
    uint256 public maxGasPerTx = 200000;
    uint256 public dailyWalletCap = 10;
    uint256 public minTradeSize = 0.01 ether;
    
    // Pool health thresholds (in ETH)
    uint256 public healthyThreshold = 5 ether;
    uint256 public cautionThreshold = 1 ether;
    uint256 public criticalThreshold = 0.1 ether;
    
    enum PoolState { Healthy, Caution, Critical, Depleted }
    PoolState public currentState = PoolState.Healthy;
    
    mapping(bytes32 => bool) public claimedTransactions;
    mapping(address => uint256) public walletDailyCount;
    mapping(address => uint256) public lastResetDay;
    
    event SubsidyPaid(address indexed relayer, address indexed user, bytes32 txHash, uint256 gasUsed, uint256 amount);
    event PoolStateUpdated(PoolState state, uint256 balance);
    event ParametersUpdated(uint256 maxGasPerTx, uint256 dailyWalletCap);
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    receive() external payable {}
    
    function addRelayer(address relayer) external onlyRole(GOVERNANCE_ROLE) {
        grantRole(RELAYER_ROLE, relayer);
        emit RelayerAdded(relayer);
    }
    
    function removeRelayer(address relayer) external onlyRole(GOVERNANCE_ROLE) {
        revokeRole(RELAYER_ROLE, relayer);
        emit RelayerRemoved(relayer);
    }
    
    function claimReimbursement(
        bytes32 txHash,
        uint256 gasUsed,
        address user,
        uint256 tradeValue
    ) external payable nonReentrant onlyRole(RELAYER_ROLE) {
        require(!claimedTransactions[txHash], "Already claimed");
        require(gasUsed <= maxGasPerTx, "Gas cap exceeded");
        require(tradeValue >= minTradeSize, "Trade too small");
        require(currentState != PoolState.Depleted, "Circuit breaker active");
        
        uint256 today = block.timestamp / 1 days;
        if (lastResetDay[user] != today) {
            lastResetDay[user] = today;
            walletDailyCount[user] = 0;
        }
        require(walletDailyCount[user] < dailyWalletCap, "Daily cap reached");
        walletDailyCount[user]++;
        
        uint256 reimbursement = gasUsed * tx.gasprice;
        uint256 maxReimbursement = address(this).balance;
        if (reimbursement > maxReimbursement) {
            reimbursement = maxReimbursement;
        }
        
        claimedTransactions[txHash] = true;
        (bool sent, ) = msg.sender.call{value: reimbursement}("");
        require(sent, "Transfer failed");
        
        emit SubsidyPaid(msg.sender, user, txHash, gasUsed, reimbursement);
    }
    
    function updatePoolState() external {
        uint256 balance = address(this).balance;
        PoolState newState;
        
        if (balance >= healthyThreshold) {
            newState = PoolState.Healthy;
        } else if (balance >= cautionThreshold) {
            newState = PoolState.Caution;
        } else if (balance >= criticalThreshold) {
            newState = PoolState.Critical;
        } else {
            newState = PoolState.Depleted;
        }
        
        if (newState != currentState) {
            currentState = newState;
            emit PoolStateUpdated(currentState, balance);
        }
    }
    
    function updateParams(
        uint256 _maxGasPerTx,
        uint256 _dailyWalletCap,
        uint256 _minTradeSize
    ) external onlyRole(GOVERNANCE_ROLE) {
        maxGasPerTx = _maxGasPerTx;
        dailyWalletCap = _dailyWalletCap;
        minTradeSize = _minTradeSize;
        emit ParametersUpdated(maxGasPerTx, dailyWalletCap);
    }
    
    function getPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getPoolState() external view returns (PoolState) {
        return currentState;
    }
}
