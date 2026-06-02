const { ethers } = require('ethers');
require('dotenv').config();

// TEFA DEX specific monitoring
class TEFAMonitor {
  constructor(provider, routerAddress, poolAddresses) {
    this.provider = provider;
    this.routerAddress = routerAddress;
    this.poolAddresses = poolAddresses;
    this.alertHistory = [];
    
    // ABI fragments for your contracts
    this.routerABI = [
      'function getPool(address,address) view returns (address)',
      'function rescueTokens(address,address) external'
    ];
    
    this.poolABI = [
      'function getReserves() view returns (uint256,uint256)',
      'function totalLpShares() view returns (uint256)',
      'function lpShares(address) view returns (uint256)'
    ];
  }

  async checkRouterStuckFunds() {
    try {
      const router = new ethers.Contract(this.routerAddress, this.routerABI, this.provider);
      
      // Check ETH balance
      const ethBalance = await this.provider.getBalance(this.routerAddress);
      if (ethBalance > 0) {
        await this.alert('STUCK_ETH', 'HIGH', 
          `${ethers.formatEther(ethBalance)} ETH stuck in Router`,
          'Call rescueTokens() immediately');
      }
      
      console.log(`✓ Router checked - ETH: ${ethers.formatEther(ethBalance)}`);
    } catch (error) {
      console.error('Router check failed:', error.message);
    }
  }

  async checkPoolHealth(poolAddress) {
    try {
      const pool = new ethers.Contract(poolAddress, this.poolABI, this.provider);
      
      const [reserve0, reserve1] = await pool.getReserves();
      const totalLp = await pool.totalLpShares();
      
      // Check for empty pool (first deposit vulnerability)
      if (totalLp.toString() === '0' || totalLp.toString() === '1000') {
        await this.alert('EMPTY_POOL', 'CRITICAL',
          `Pool ${poolAddress} has only burned shares - first deposit risk!`,
          'Monitor first deposit closely');
      }
      
      // Check for suspiciously low reserves
      if (reserve0 === 0n || reserve1 === 0n) {
        await this.alert('ZERO_RESERVES', 'CRITICAL',
          `Pool ${poolAddress} has zero reserves - possible drain!`,
          'Investigate immediately');
      }
      
      console.log(`✓ Pool ${poolAddress.slice(0,10)} - Reserves: ${ethers.formatEther(reserve0)} / ${ethers.formatEther(reserve1)}`);
    } catch (error) {
      console.error(`Pool ${poolAddress} check failed:`, error.message);
    }
  }

  async alert(type, severity, details, action) {
    const alert = {
      timestamp: new Date().toISOString(),
      type,
      severity,
      details,
      action,
      source: 'TEFA_MONITOR'
    };
    
    this.alertHistory.push(alert);
    
    // Console alert (visible in your terminal)
    console.log('\n🚨 =========================================');
    console.log(`🚨 ${severity} ALERT: ${type}`);
    console.log(`🚨 ${details}`);
    console.log(`🚨 ACTION: ${action}`);
    console.log('🚨 =========================================\n');
    
    // Send to Discord webhook if configured
    if (process.env.DISCORD_WEBHOOK) {
      try {
        const fetch = (await import('node-fetch')).default;
        await fetch(process.env.DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `🚨 ${severity} - ${type}`,
              description: details,
              fields: [
                { name: 'Action Required', value: action },
                { name: 'Time', value: alert.timestamp }
              ],
              color: severity === 'CRITICAL' ? 0xFF0000 : 0xFFA500
            }]
          })
        });
      } catch (e) {
        console.log('Discord webhook failed:', e.message);
      }
    }
  }

  async start(intervalSeconds = 30) {
    console.log('🛡️ TEFA DEX Security Monitor Started');
    console.log(`   Router: ${this.routerAddress}`);
    console.log(`   Pools: ${this.poolAddresses.length}`);
    console.log(`   Check interval: ${intervalSeconds}s\n`);
    
    while (true) {
      await this.checkRouterStuckFunds();
      
      for (const pool of this.poolAddresses) {
        await this.checkPoolHealth(pool);
      }
      
      console.log(`\n⏰ Next check in ${intervalSeconds} seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }
  }
}

// Configuration from environment
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
const POOL_ADDRESSES = process.env.POOL_ADDRESSES ? process.env.POOL_ADDRESSES.split(',') : [];

if (!ROUTER_ADDRESS) {
  console.error('❌ ROUTER_ADDRESS not set in .env');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const monitor = new TEFAMonitor(provider, ROUTER_ADDRESS, POOL_ADDRESSES);

monitor.start(30).catch(console.error);
