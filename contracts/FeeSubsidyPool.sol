// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IEligibilityOracle {
    function isEligibleForSubsidy(address user) external view returns (bool);
}

interface IRelayerRegistry {
    function isRelayer(address account) external view returns (bool);
}

contract FeeSubsidyPool is AccessControl, ReentrancyGuard {
    address public relayerRegistry;
    address public eligibilityOracle;
    
    uint256 public maxGasPerTx = 200000;
    uint256 public dailyWalletCap = 10;
    
    mapping(bytes32 => bool) public claimedTransactions;
    mapping(address => uint256) public dailyTxCount;
    mapping(address => uint256) public lastReset;
    
    event SubsidyPaid(address indexed relayer, address indexed user, bytes32 indexed txHash, uint256 amount);
    event PoolFunded(address indexed source, uint256 amount);
    
    constructor(address _relayerRegistry, address _eligibilityOracle) {
        require(_relayerRegistry != address(0), "Invalid registry");
        require(_eligibilityOracle != address(0), "Invalid oracle");
        
        relayerRegistry = _relayerRegistry;
        eligibilityOracle = _eligibilityOracle;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function claimReimbursement(
        bytes32 txHash,
        address user,
        uint256 gasUsed,
        uint256 gasPrice
    ) external nonReentrant returns (uint256) {
        // Check relayer is whitelisted
        (bool success, bytes memory data) = relayerRegistry.staticcall(
            abi.encodeWithSignature("isRelayer(address)", msg.sender)
        );
        require(success && data.length > 0 && abi.decode(data, (bool)), "Not relayer");
        
        require(!claimedTransactions[txHash], "Already claimed");
        require(gasUsed <= maxGasPerTx, "Gas exceeds cap");
        require(user != address(0), "Invalid user");
        
        // Check eligibility
        (success, data) = eligibilityOracle.staticcall(
            abi.encodeWithSignature("isEligibleForSubsidy(address)", user)
        );
        require(success && data.length > 0 && abi.decode(data, (bool)), "Not eligible");
        
        // Check daily cap
        if (block.timestamp >= lastReset[user] + 1 days) {
            dailyTxCount[user] = 0;
            lastReset[user] = block.timestamp;
        }
        require(dailyTxCount[user] < dailyWalletCap, "Daily cap reached");
        
        uint256 reimbursement = gasUsed * gasPrice;
        require(reimbursement <= address(this).balance, "Insufficient pool balance");
        
        claimedTransactions[txHash] = true;
        dailyTxCount[user]++;
        
        (bool transferSuccess, ) = msg.sender.call{value: reimbursement}("");
        require(transferSuccess, "Transfer failed");
        
        emit SubsidyPaid(msg.sender, user, txHash, reimbursement);
        return reimbursement;
    }
    
    function getEligibility(address user) external view returns (bool eligible, uint256 dailyLeft) {
        (bool success, bytes memory data) = eligibilityOracle.staticcall(
            abi.encodeWithSignature("isEligibleForSubsidy(address)", user)
        );
        eligible = success && data.length > 0 && abi.decode(data, (bool));
        
        uint256 used = dailyTxCount[user];
        dailyLeft = dailyWalletCap > used ? dailyWalletCap - used : 0;
    }
    
    receive() external payable {
        emit PoolFunded(msg.sender, msg.value);
    }
}
