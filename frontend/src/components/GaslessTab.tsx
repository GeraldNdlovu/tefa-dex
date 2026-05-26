import { useState } from 'react';
import { ethers } from 'ethers';
import { executeGaslessSwap } from '../utils/gasless';
import { Zap } from 'lucide-react';

const TOKEN_A = '0x6644F8db48e76c54033D332304F6922aE962eD2C';
const TOKEN_B = '0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB';
const ROUTER_ADDRESS = '0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2';

export function GaslessTab({ account, provider, signer, onRefresh }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSwap = async () => {
    if (!account) {
      alert('Please connect wallet');
      return;
    }

    setLoading(true);
    try {
      const amountIn = ethers.parseEther(amount || '0');
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      const result = await executeGaslessSwap(
        provider,
        signer,
        ROUTER_ADDRESS,
        TOKEN_A,
        TOKEN_B,
        amountIn,
        0n,
        deadline
      );

      setTxHash(result.txHash);
      onRefresh();
      alert('Swap submitted! Tx: ' + result.txHash.slice(0, 10) + '...');
    } catch (error: any) {
      console.error(error);
      alert('Swap failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-semibold">Gasless Swap</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">ZERO GAS</span>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>You pay</span>
          <span className="text-green-400">0 ETH (relayer pays)</span>
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
        {loading ? 'Processing...' : 'Swap Gasless'}
      </button>

      {txHash && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Tx: <a href={'https://sepolia.etherscan.io/tx/' + txHash} target="_blank" className="text-purple-400">
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}
