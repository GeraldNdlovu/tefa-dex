const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const CONFIG = {
  // Your contract addresses (update after deployment)
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS,
  POOL_ADDRESSES: process.env.POOL_ADDRESSES?.split(',') || [],
  
  // Alert thresholds
  ALERT_THRESHOLDS: {
    MAX_SWAP_SIZE_PERCENT: 10,        // Alert if swap >10% of pool
    MAX_PRICE_IMPACT_PERCENT: 5,       // Alert if price impact >5%
    MIN_LIQUIDITY_DECREASE_PERCENT: 30, // Alert if liquidity drops 30% fast
    SUSPICIOUS_WITHDRAWAL_PERCENT: 50,  // Alert if LP removes >50% in one tx
    MAX_GAS_PRICE_GWEI: 500,           // Alert if gas >500 gwei (potential attack)
  },
  
  // Vulnerability patterns to monitor
  VULNERABILITY_SIGNATURES: {
    REENTRANCY: '0x%',                 // Multiple calls in same block
    SANDWICH: 'frontrun_pattern',       // Same block buy then sell
    FLASH_LOAN: 'flashloan_sequence',   // Borrow → Manipulate → Repay
    LP_INFLATION: 'first_deposit_risk', // Empty pool deposit
  }
};

class DEXMonitor {
  constructor(provider) {
    this.provider = provider;
    this.lastReserves = new Map();
    this.alertHistory = [];
  }

  // Monitor 1: Reentrancy detection
  async detectReentrancy(txHash, contractAddress) {
    const tx = await this.provider.getTransaction(txHash);
    const receipt = await this.provider.getTransactionReceipt(txHash);
    
    // Check if same contract called multiple times in same tx
    const internalCalls = receipt.logs.filter(log => 
      log.address.toLowerCase() === contractAddress.toLowerCase()
    );
    
    if (internalCalls.length > 3) {
      await this.sendAlert({
        type: 'REENTRANCY_RISK',
        severity: 'HIGH',
        txHash,
        details: `${internalCalls.length} calls to same contract in one transaction`,
        action: 'IMMEDIATE_PAUSE_RECOMMENDED'
      });
      return true;
    }
    return false;
  }

  // Monitor 2: Price manipulation / Sandwich detection
  async detectSandwich(txHash, poolAddress) {
    // Get transactions before and after in same block
    const block = await this.provider.getBlock('latest');
    const txsInBlock = block.transactions;
    
    // Look for pattern: buy → user tx → sell
    const txIndex = txsInBlock.indexOf(txHash);
    if (txIndex > 0 && txIndex < txsInBlock.length - 1) {
      const beforeTx = txsInBlock[txIndex - 1];
      const afterTx = txsInBlock[txIndex + 1];
      
      await this.sendAlert({
        type: 'SANDWICH_ATTEMPT',
        severity: 'MEDIUM',
        txHash,
        details: 'Transaction sandwiched between two trades',
        recommendation: 'User lost to MEV - consider private mempool'
      });
    }
  }

  // Monitor 3: Liquidity pool health
  async monitorPoolHealth(poolAddress) {
    const pool = new ethers.Contract(poolAddress, [
      'function getReserves() view returns (uint256, uint256)',
      'function totalLpShares() view returns (uint256)'
    ], this.provider);
    
    const [reserve0, reserve1] = await pool.getReserves();
    const totalLp = await pool.totalLpShares();
    
    // Check for empty pool (first deposit vulnerability)
    if (totalLp.toString() === '1000') { // Only the burned shares
      await this.sendAlert({
        type: 'EMPTY_POOL',
        severity: 'HIGH',
        poolAddress,
        details: 'Pool is empty - first deposit risk!',
        action: 'REQUIRES_IMMEDIATE_REVIEW'
      });
    }
    
    // Check for sudden liquidity drop
    const last = this.lastReserves.get(poolAddress);
    if (last) {
      const drop0 = (last.reserve0 - reserve0) / last.reserve0;
      const drop1 = (last.reserve1 - reserve1) / last.reserve1;
      
      if (drop0 > 0.3 || drop1 > 0.3) { // 30% drop
        await this.sendAlert({
          type: 'LIQUIDITY_DRAIN',
          severity: 'CRITICAL',
          poolAddress,
          details: `Liquidity dropped ${Math.max(drop0, drop1) * 100}%`,
          action: 'IMMEDIATE_INVESTIGATION'
        });
      }
    }
    
    this.lastReserves.set(poolAddress, { reserve0, reserve1, timestamp: Date.now() });
  }

  // Monitor 4: Router stuck funds
  async monitorRouterBalance(routerAddress) {
    const balance = await this.provider.getBalance(routerAddress);
    const tokenBalance = await this.getTokenBalances(routerAddress);
    
    if (balance > ethers.parseEther('1')) { // >1 ETH stuck
      await this.sendAlert({
        type: 'STUCK_FUNDS',
        severity: 'HIGH',
        routerAddress,
        details: `${ethers.formatEther(balance)} ETH stuck in Router`,
        action: 'USE_RESCUE_TOKENS_FUNCTION'
      });
    }
    
    Object.entries(tokenBalance).forEach(([token, amount]) => {
      if (amount > ethers.parseEther('100')) {
        this.sendAlert({
          type: 'STUCK_TOKENS',
          severity: 'MEDIUM',
          token,
          details: `${ethers.formatEther(amount)} tokens stuck in Router`,
          action: 'USE_RESCUE_TOKENS_FUNCTION'
        });
      }
    });
  }

  // Monitor 5: Unusual gas prices (attack indicator)
  async monitorGasPrice() {
    const feeData = await this.provider.getFeeData();
    const gasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
    
    if (gasPriceGwei > CONFIG.ALERT_THRESHOLDS.MAX_GAS_PRICE_GWEI) {
      await this.sendAlert({
        type: 'HIGH_GAS',
        severity: 'INFO',
        details: `Gas price at ${gasPriceGwei} gwei`,
        recommendation: 'Possible MEV bot activity or network congestion'
      });
    }
  }

  // Send alert (multichannel)
  async sendAlert(alert) {
    alert.timestamp = new Date().toISOString();
    this.alertHistory.push(alert);
    
    console.log(`🚨 ${alert.severity} ALERT: ${alert.type}`);
    console.log(`   ${alert.details}`);
    console.log(`   Action: ${alert.action || 'Monitor'}`);
    
    // Webhook to Discord/Telegram/Slack
    if (process.env.DISCORD_WEBHOOK) {
      await fetch(process.env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🚨 ${alert.severity} - ${alert.type}`,
            description: alert.details,
            fields: [
              { name: 'Action', value: alert.action || 'Monitor' },
              { name: 'Time', value: alert.timestamp }
            ],
            color: alert.severity === 'CRITICAL' ? 0xFF0000 : 0xFFA500
          }]
        })
      });
    }
    
    // Store for dashboard
    await this.saveAlertToDatabase(alert);
  }

  async saveAlertToDatabase(alert) {
    // You can add PostgreSQL/MySQL here
    console.log('Alert saved to history');
  }

  async getTokenBalances(address) {
    // Implement token balance checking for all known tokens
    return {};
  }

  // Main monitoring loop
  async start() {
    console.log('🔍 TEFA DEX Monitor Started');
    console.log(`   Monitoring ${CONFIG.POOL_ADDRESSES.length} pools`);
    
    setInterval(async () => {
      for (const pool of CONFIG.POOL_ADDRESSES) {
        await this.monitorPoolHealth(pool);
      }
      await this.monitorRouterBalance(CONFIG.ROUTER_ADDRESS);
      await this.monitorGasPrice();
    }, 12000); // Every block (~12 seconds)
  }
}

module.exports = { DEXMonitor };
