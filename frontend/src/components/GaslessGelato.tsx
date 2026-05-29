import { useState } from 'react';
import { ethers } from 'ethers';
import { gaslessSwap } from '../utils/gelato';
import { Zap } from 'lucide-react';

export function GaslessGelato({ account, provider, onRefresh }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState('');

  const handleSwap = async () => {
    if (!account || !provider) {
      alert('Connect wallet first');
      return;
    }
    setLoading(true);
    try {
      const amountIn = ethers.parseEther(amount || '0');
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const task = await gaslessSwap(provider, amountIn, deadline);
      setTaskId(task);
      alert(`Swap sent to Gelato! Task ID: ${task.slice(0,10)}...`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-semibold">Gasless Swap (Gelato)</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">⚡ 0 Gas</span>
      </div>
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>You pay</span>
          <span className="text-green-400">0 ETH (Gelato pays)</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-gray-300 text-sm mb-2 block">Amount (TKA)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white"
        />
      </div>
      <button
        onClick={handleSwap}
        disabled={loading || !amount || !account}
        className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Swap Gasless (Gelato)'}
      </button>
      {taskId && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Task: <a href={`https://api/gasless/submit.gelato.network/tasks/${taskId}`} target="_blank" className="text-purple-400">
            {taskId.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}
