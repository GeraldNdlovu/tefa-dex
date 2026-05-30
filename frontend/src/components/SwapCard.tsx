import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowDownUp, ArrowRight, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface SwapCardProps {
  account: string | null;
  provider: any;
  onRefresh?: () => void;
}

export function SwapCard({ account, provider, onRefresh }: SwapCardProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromToken, setFromToken] = useState('TKA');
  const [toToken, setToToken] = useState('TKB');
  const [txHash, setTxHash] = useState('');
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0.137);

  const TOKEN_ADDRESSES = {
    TKA: '0xe64F6E38F004eDE64756dd62d4F10Ce28721e155',
    TKB: '0xa2a5CF99ae48dfAF190186f734142C6D17E887B9'
  };

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
    setExchangeRate(1 / exchangeRate);
  };

  const estimateOutput = (input: string) => {
    if (!input || parseFloat(input) === 0) {
      setToAmount('');
      return;
    }
    const output = (parseFloat(input) * exchangeRate).toFixed(6);
    setToAmount(output);
  };

  useEffect(() => {
    estimateOutput(fromAmount);
  }, [fromAmount, exchangeRate]);

  const handleSwap = async () => {
    if (!account || !provider) {
      toast.error('Connect wallet first');
      return;
    }
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    
    setLoading(true);
    setStatus('signing');
    
    const toastId = toast.loading('Waiting for signature...');
    
    try {
      const { customGaslessSwap } = await import('../utils/gasless-custom');
      const tokenIn = TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES];
      const amountIn = ethers.parseEther(fromAmount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      
      toast.loading('Signing transaction...', { id: toastId });
      
      const result = await customGaslessSwap(provider, amountIn, deadline);
      
      setJobId(result.jobId);
      setStatus('queued');
      toast.success('Swap queued! Processing...', { id: toastId, duration: 2000 });
      toast.loading('Relayer processing your swap...', { id: toastId });
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`https://dex.147.182.193.26.nip.io/api/gasless/status/${result.jobId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.state === 'completed' && data.txHash) {
              setTxHash(data.txHash);
              setStatus('completed');
              toast.success('Swap confirmed on-chain! 🎉', { id: toastId, duration: 5000 });
              clearInterval(pollInterval);
              if (onRefresh) onRefresh();
            } else if (data.state === 'failed') {
              setStatus('failed');
              toast.error(`Swap failed: ${data.failedReason || 'Unknown error'}`, { id: toastId });
              clearInterval(pollInterval);
            }
          }
        } catch (err) {}
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      toast.error(err.message || 'Swap failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (status === 'signing') return { text: 'Sign in wallet', color: 'bg-yellow-500/20 text-yellow-400' };
    if (status === 'queued') return { text: 'Processing', color: 'bg-blue-500/20 text-blue-400' };
    if (status === 'completed') return { text: 'Completed', color: 'bg-green-500/20 text-green-400' };
    if (status === 'failed') return { text: 'Failed', color: 'bg-red-500/20 text-red-400' };
    return null;
  };

  const badge = getStatusBadge();

  return (
    <div className="glass-card p-6">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Swap Tokens</h2>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">⚡ 0 Gas</span>
        </div>
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>{badge.text}</span>
        )}
      </div>

      {/* From Input */}
      <div className="bg-gray-800/50 rounded-2xl p-4 mb-3">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>You pay</span>
          <button className="text-xs text-purple-400 hover:text-purple-300">MAX</button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white outline-none"
            disabled={loading}
          />
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl px-3 py-2">
            <span className="font-semibold text-white">{fromToken}</span>
          </div>
        </div>
      </div>

      {/* Swap Arrow with Flip Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={flipTokens}
          className="bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-all rotate-90 hover:rotate-0 duration-300"
        >
          <ArrowDownUp className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* To Input */}
      <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>You receive</span>
          <span className="text-xs">Rate: 1 {fromToken} ≈ {exchangeRate.toFixed(6)} {toToken}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white outline-none"
          />
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl px-3 py-2">
            <span className="font-semibold text-white">{toToken}</span>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !fromAmount || !account}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {status === 'signing' ? 'Awaiting Signature...' : 'Processing...'}
          </span>
        ) : (
          `Swap ${fromToken} → ${toToken}`
        )}
      </button>

      {txHash && (
        <div className="mt-4 text-center">
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {!account && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Connect wallet to start gasless trading
        </p>
      )}
    </div>
  );
}
