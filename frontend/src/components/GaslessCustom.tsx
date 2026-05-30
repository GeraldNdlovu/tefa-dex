import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import { customGaslessSwap } from '../utils/gasless-custom';
import { Zap, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export function GaslessCustom({ account, provider, onRefresh }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');
  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState('');

  // Poll for job completion
  useEffect(() => {
    if (!jobId) return;
    
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://dex.147.182.193.26.nip.io/api/job/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.state === 'completed' && data.txHash) {
            if (isMounted) {
              setTxHash(data.txHash);
              setStatus('completed');
              toast.success('Swap confirmed on-chain!', {
                duration: 10000,
                icon: '🎉',
              });
              clearInterval(pollInterval);
              if (onRefresh) onRefresh();
            }
          } else if (data.state === 'failed') {
            if (isMounted) {
              setStatus('failed');
              toast.error(`Swap failed: ${data.failedReason || 'Unknown error'}`);
              clearInterval(pollInterval);
            }
          }
        }
      } catch (err) {
        // Still processing
      }
    }, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [jobId, onRefresh]);

  const handleSwap = async () => {
    if (!account || !provider) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setStatus('signing');
    
    const toastId = toast.loading('Waiting for signature...');
    
    try {
      const amountIn = ethers.parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      
      toast.loading('Signing transaction...', { id: toastId });
      
      const result = await customGaslessSwap(provider, amountIn, deadline);
      
      setJobId(result.jobId);
      setStatus('queued');
      
      toast.success('Swap queued! Processing...', { 
        id: toastId,
        duration: 3000,
      });
      
      toast.loading('Relayer processing your swap...', { id: toastId });
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      toast.error(err.message || 'Swap failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'signing': return <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />;
      case 'queued': return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'signing': return 'Awaiting signature in wallet...';
      case 'queued': return 'Queued - relayer processing...';
      case 'completed': return 'Swap confirmed on-chain!';
      case 'failed': return 'Swap failed';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6">
      <Toaster position="top-right" />
      
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-semibold">Gasless Swap</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">⚡ 0 Gas</span>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">You pay</span>
          <span className="text-green-400">0 ETH (relayer pays gas)</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Estimated time</span>
          <span>~10-30 seconds</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="text-gray-300 text-sm mb-2 block">Amount (TKA)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>
      
      {status && (
        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
          status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
          status === 'failed' ? 'bg-red-500/10 border border-red-500/20' :
          'bg-blue-500/10 border border-blue-500/20'
        }`}>
          {getStatusIcon()}
          <span className="text-sm text-gray-300 flex-1">{getStatusText()}</span>
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {jobId && !txHash && status !== 'failed' && (
            <span className="text-xs text-gray-500">Job: {jobId.slice(0, 8)}...</span>
          )}
        </div>
      )}
      
      <button
        onClick={handleSwap}
        disabled={loading || !amount || !account}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          'Swap Gasless'
        )}
      </button>
      
      {!account && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Connect wallet to start gasless trading
        </p>
      )}
    </div>
  );
}
