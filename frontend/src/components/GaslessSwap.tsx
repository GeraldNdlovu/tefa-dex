import { useState } from 'react';
import { ethers } from 'ethers';
import { executeGaslessSwap } from '../utils/gasless';

const TOKEN_A = '0x6644F8db48e76c54033D332304F6922aE962eD2C';
const TOKEN_B = '0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB';
const ROUTER_ADDRESS = '0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2';

export function GaslessSwap() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSwap = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const amountIn = ethers.parseEther(amount || '0');
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      const result = await executeGaslessSwap(
        provider, signer, ROUTER_ADDRESS,
        TOKEN_A, TOKEN_B, amountIn, 0n, deadline
      );

      setTxHash(result.txHash);
      alert(`✅ Swap submitted! Tx: ${result.txHash.slice(0, 10)}...`);
    } catch (error: any) {
      console.error(error);
      alert(`❌ Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Gasless Swap</h2>
      <p style={{ color: '#00ff00', fontSize: '14px' }}>⛽ You pay ZERO gas. Relayer pays.</p>
      <input 
        type="number" 
        placeholder="Amount of TKA" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <button 
        onClick={handleSwap} 
        disabled={loading || !amount}
        style={{ 
          width: '100%', 
          padding: '10px', 
          background: '#0066ff', 
          color: 'white', 
          border: 'none', 
          cursor: loading ? 'not-allowed' : 'pointer' 
        }}
      >
        {loading ? 'Swapping...' : 'Swap Gasless'}
      </button>
      {txHash && (
        <p style={{ marginTop: '10px', fontSize: '12px' }}>
          Tx: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}
