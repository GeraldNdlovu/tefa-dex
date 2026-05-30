import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, RefreshCw, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';

export function Liquidity({ account }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addToken, setAddToken] = useState<'TKA' | 'TKB'>('TKA');
  const [removeAmount, setRemoveAmount] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);

  // Static pool data – no contract calls
  const reserveTKA = '1158.79';
  const reserveTKB = '159.26';
  const userShare = '0'; // no liquidity added yet

  const getRate = () => {
    const r0 = parseFloat(reserveTKA);
    const r1 = parseFloat(reserveTKB);
    if (r0 === 0 || r1 === 0) return 0;
    return addToken === 'TKA' ? r1 / r0 : r0 / r1;
  };

  const getOtherAmount = () => {
    if (!addAmount) return '';
    const rate = getRate();
    return (parseFloat(addAmount) * rate).toFixed(6);
  };

  const handleAddLiquidity = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setIsAdding(true);
    const toastId = toast.loading('Simulating add liquidity...');
    await new Promise(r => setTimeout(r, 1500));
    const mockHash = `0x${Math.random().toString(36).substring(2, 42)}`;
    setTxHash(mockHash);
    toast.update(toastId, {
      render: () => (
        <div>
          <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
          Added {addAmount} {addToken} + {getOtherAmount()} {(addToken === 'TKA' ? 'TKB' : 'TKA')} (simulated)
          <br />
          <a href={`https://sepolia.etherscan.io/tx/${mockHash}`} target="_blank" className="text-blue-400 text-xs underline">View on Etherscan</a>
        </div>
      ),
      type: 'success',
      isLoading: false,
      autoClose: 5000
    });
    setAddAmount('');
    setTimeout(() => setTxHash(null), 5000);
    setIsAdding(false);
  };

  const handleRemoveLiquidity = async () => {
    if (!removeAmount || parseFloat(removeAmount) <= 0) {
      toast.error('Enter LP token amount');
      return;
    }
    setIsRemoving(true);
    const toastId = toast.loading('Simulating removal...');
    await new Promise(r => setTimeout(r, 1500));
    const mockHash = `0x${Math.random().toString(36).substring(2, 42)}`;
    setTxHash(mockHash);
    toast.update(toastId, {
      render: () => (
        <div>
          <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
          Removed {removeAmount} LP tokens (simulated)
          <br />
          <a href={`https://sepolia.etherscan.io/tx/${mockHash}`} target="_blank" className="text-blue-400 text-xs underline">View on Etherscan</a>
        </div>
      ),
      type: 'success',
      isLoading: false,
      autoClose: 5000
    });
    setRemoveAmount('');
    setIsRemoving(false);
  };

  if (!account) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">Connect Wallet</h3>
        <p className="text-gray-400 text-sm">Connect your wallet to provide liquidity</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Pool Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">TKA Reserve</p>
            <p className="text-white font-bold text-xl">{reserveTKA}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">TKB Reserve</p>
            <p className="text-white font-bold text-xl">{reserveTKB}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Exchange Rate</p>
            <p className="text-white font-bold text-xl">1 TKA = {(parseFloat(reserveTKB)/parseFloat(reserveTKA)).toFixed(6)} TKB</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Your Share</p>
            <p className="text-white font-bold text-xl">{userShare}%</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg"><Plus className="w-5 h-5 text-green-400" /></div>
          <h2 className="text-white font-semibold">Add Liquidity</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setAddToken('TKA')} className={`px-3 py-1 rounded-lg text-sm ${addToken === 'TKA' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>TKA</button>
            <button onClick={() => setAddToken('TKB')} className={`px-3 py-1 rounded-lg text-sm ${addToken === 'TKB' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>TKB</button>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">{addToken} Amount</label>
            <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0.0"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" disabled={isAdding} />
          </div>
          <div className="flex justify-center"><ArrowRightLeft className="w-5 h-5 text-gray-500" /></div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">{(addToken === 'TKA' ? 'TKB' : 'TKA')} Amount (auto)</label>
            <input type="text" value={getOtherAmount()} readOnly placeholder="0.0"
              className="w-full bg-gray-800/30 border border-gray-700 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" />
          </div>
          <button onClick={handleAddLiquidity} disabled={isAdding || !addAmount}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isAdding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Processing...' : 'Add Liquidity'}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg"><Minus className="w-5 h-5 text-red-400" /></div>
          <h2 className="text-white font-semibold">Remove Liquidity</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">LP Token Amount</label>
            <input type="number" value={removeAmount} onChange={(e) => setRemoveAmount(e.target.value)} placeholder="0.0"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" disabled={isRemoving} />
          </div>
          <button onClick={handleRemoveLiquidity} disabled={isRemoving || !removeAmount}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isRemoving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Minus className="w-5 h-5" />}
            {isRemoving ? 'Processing...' : 'Remove Liquidity'}
          </button>
        </div>
      </div>

      {txHash && (
        <div className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-green-400 text-sm font-medium">Transaction Complete (simulated)</p>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="text-xs text-gray-400 hover:text-white">View on Etherscan →</a>
        </div>
      )}
    </div>
  );
}
