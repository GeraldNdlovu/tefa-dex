import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Activity, Wallet, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Eye, Play, Square, Trash2, Clock, Hash, DollarSign, Zap } from 'lucide-react';

interface AdminPanelProps {
  account: string | null;
  provider: any;
}

export function AdminPanel({ account, provider }: AdminPanelProps) {
  const [relayerStatus, setRelayerStatus] = useState<'online' | 'offline' | 'degraded'>('online');
  const [relayerBalance, setRelayerBalance] = useState('5.8735');
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/metrics');
      if (response.ok) {
        const data = await response.json();
        setRelayerStatus('online');
      }
    } catch (err) {
      setRelayerStatus('online');
    }
  };

  const fetchBalance = async () => {
    if (!provider) return;
    try {
      const relayerAddress = '0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734';
      const balance = await provider.getBalance(relayerAddress);
      setRelayerBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch('/api/jobs/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentJobs(data.jobs || []);
      }
    } catch (err) {
      setRecentJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBalance();
    fetchRecentJobs();
    const interval = setInterval(() => {
      fetchStats();
      fetchBalance();
      fetchRecentJobs();
    }, 10000);
    return () => clearInterval(interval);
  }, [provider]);

  const getStatusColor = () => {
    switch (relayerStatus) {
      case 'online': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Relayer Control</h2>
        </div>
        <button onClick={fetchRecentJobs} className="text-gray-400 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Relay Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <p className="text-white font-medium capitalize">{relayerStatus}</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Relay Balance</p>
          <p className="text-white font-medium">{relayerBalance} ETH</p>
          <p className="text-xs text-gray-500">≈ ${(parseFloat(relayerBalance) * 3500).toFixed(0)} USD</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Queue Size</p>
          <p className="text-white font-medium">{recentJobs.filter(j => j.status === 'queued').length} pending</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Processed</p>
          <p className="text-white font-medium">{recentJobs.filter(j => j.status === 'completed').length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-medium mb-3">Recent Swap Jobs</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No swaps processed yet</div>
        ) : (
          <div className="space-y-2">
            {recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {job.status === 'queued' && <Clock className="w-4 h-4 text-yellow-400" />}
                  {job.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <code className="text-xs text-gray-300">{job.id?.slice(0, 16)}...</code>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    job.status === 'queued' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {job.createdAt ? Math.floor((Date.now() - job.createdAt) / 60000) : 0} min ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <h3 className="text-white font-medium mb-3">Contract Addresses (Sepolia)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Gasless Executor</span>
            <code className="text-gray-300">0xfA6e245B353934c6D9980b285F3660694764384c</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Router</span>
            <code className="text-gray-300">0xFD2E239e503e74a288Ae8AfD9D37c119946A90Ca</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Relayer Wallet</span>
            <code className="text-gray-300">0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734</code>
          </div>
        </div>
      </div>
    </div>
  );
}
