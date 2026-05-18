import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Wallet, Activity, DollarSign } from 'lucide-react';

const FSP_ADDRESS = "0xEcB93d5378985BAe86Bd727dddDB92884519f328";
const RELAYER_REGISTRY = "0x37610cBb430F8f46214dD30aD8736DBa698ACf9F";

const RELAYER_REGISTRY_ABI = [
  "function getActiveRelayers() view returns (address[])"
];

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)"
];

interface AdminProps {
  account: string;
  provider: any;
}

export function Admin({ account, provider }: AdminProps) {
  const [fspBalance, setFspBalance] = useState<string>('0');
  const [activeRelayers, setActiveRelayers] = useState<string[]>([]);
  const [poolReserves, setPoolReserves] = useState<{ tka: string; tkb: string }>({ tka: '0', tkb: '0' });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (provider) {
      loadAdminData();
      const interval = setInterval(loadAdminData, 30000);
      return () => clearInterval(interval);
    }
  }, [provider]);

  const loadAdminData = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const fspBalanceWei = await provider.getBalance(FSP_ADDRESS);
      setFspBalance(ethers.formatEther(fspBalanceWei));
      
      const registry = new ethers.Contract(RELAYER_REGISTRY, RELAYER_REGISTRY_ABI, provider);
      const relayers = await registry.getActiveRelayers();
      setActiveRelayers(relayers);
      
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      setPoolReserves({
        tka: Number(ethers.formatEther(reserve0)).toFixed(2),
        tkb: Number(ethers.formatEther(reserve1)).toFixed(2)
      });
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Connect wallet to access admin panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-purple-400" />
          <h2 className="text-white text-xl font-semibold">Admin Control Panel</h2>
          <button onClick={loadAdminData} className="ml-auto p-2 text-gray-400 hover:text-white transition">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Fee Subsidy Pool (FSP)</h3>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Balance</p>
          <p className="text-white text-2xl font-bold">{parseFloat(fspBalance).toFixed(4)} ETH</p>
        </div>
        {parseFloat(fspBalance) < 0.1 && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">⚠️ Low FSP balance - Consider adding funds</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Pool Status</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs">TKA Reserve</p>
            <p className="text-white text-xl font-bold">{poolReserves.tka}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">TKB Reserve</p>
            <p className="text-white text-xl font-bold">{poolReserves.tkb}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Active Relayers ({activeRelayers.length})</h3>
        </div>
        {activeRelayers.length === 0 ? (
          <p className="text-gray-400 text-sm">No active relayers</p>
        ) : (
          <div className="space-y-2">
            {activeRelayers.slice(0, 5).map((relayer, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-mono">{relayer.slice(0, 10)}...{relayer.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-500">Data refreshes every 30 seconds</div>
    </div>
  );
}
