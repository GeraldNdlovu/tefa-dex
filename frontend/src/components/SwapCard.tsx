import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function SwapCard() {
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [tkaBalance, setTkaBalance] = useState<string>('0');
  const [tkbBalance, setTkbBalance] = useState<string>('0');
  const [reserve0, setReserve0] = useState<string>('0');
  const [reserve1, setReserve1] = useState<string>('0');

  const loadBalances = async (address: string, provider: ethers.Provider) => {
    try {
      const tokenA = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_A,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const tokenB = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_B,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      
      const tka = await tokenA.balanceOf(address);
      const tkb = await tokenB.balanceOf(address);
      setTkaBalance(ethers.formatEther(tka));
      setTkbBalance(ethers.formatEther(tkb));
    } catch (error) {
      console.error('Error loading balances');
    }
  };

  const loadPoolInfo = async (provider: ethers.Provider) => {
    try {
      const pool = new ethers.Contract(
        CONTRACT_ADDRESSES.POOL,
        ['function reserve0() view returns (uint256)', 'function reserve1() view returns (uint256)'],
        provider
      );
      const r0 = await pool.reserve0();
      const r1 = await pool.reserve1();
      setReserve0(ethers.formatEther(r0));
      setReserve1(ethers.formatEther(r1));
    } catch (error) {
      console.error('Error loading pool info');
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setUserAddress(address);
      
      await loadBalances(address, provider);
      await loadPoolInfo(provider);
      
      alert(`✅ Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed. Make sure Hardhat node is running.');
    }
  };

  useEffect(() => {
    if (amountIn && !isNaN(parseFloat(amountIn))) {
      const amount = parseFloat(amountIn);
      const fee = amount * 0.003;
      const output = amount - fee;
      setAmountOut(output.toFixed(6));
    }
  }, [amountIn]);

  const handleSwap = async () => {
    if (!signer) {
      alert('Connect wallet first');
      return;
    }

    setLoading(true);
    try {
      const router = new ethers.Contract(
        CONTRACT_ADDRESSES.ROUTER,
        ['function swap(address,address,uint256) returns (uint256)'],
        signer
      );

      const tokenA = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_A,
        ['function approve(address,uint256) returns (bool)'],
        signer
      );

      const amountInWei = ethers.parseEther(amountIn);
      
      const approveTx = await tokenA.approve(CONTRACT_ADDRESSES.ROUTER, amountInWei);
      await approveTx.wait();
      
      const tx = await router.swap(CONTRACT_ADDRESSES.TOKEN_A, CONTRACT_ADDRESSES.TOKEN_B, amountInWei);
      await tx.wait();
      
      if (signer.provider) {
        const address = await signer.getAddress();
        await loadBalances(address, signer.provider);
      }
      alert(`✅ Swap successful!`);
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      alert('Swap failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30">
            <span className="text-4xl">🔄</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            TEFA
          </h1>
          <p className="text-gray-400 mt-2">Gasless • Multi-Chain • Beautiful</p>
          
          {userAddress && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-mono">
                {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {userAddress && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">TKA Balance</p>
              <p className="text-xl font-bold text-emerald-400">{parseFloat(tkaBalance).toFixed(2)}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">TKB Balance</p>
              <p className="text-xl font-bold text-emerald-400">{parseFloat(tkbBalance).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Swap Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
          {/* From */}
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-400">From</span>
              <span className="text-emerald-400 font-mono">TKA</span>
            </div>
            <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-3xl outline-none text-white placeholder-gray-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 shadow-lg">
                <span className="text-xl">↓</span>
              </div>
            </div>
          </div>

          {/* To */}
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-400">To</span>
              <span className="text-emerald-400 font-mono">TKB</span>
            </div>
            <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
              <div className="text-3xl text-white font-mono">
                {loading ? '...' : (amountOut || '0.0')}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-2">
              ≈ 0.3% fee included
            </div>
          </div>

          {/* Connect Button */}
          {!signer && (
            <button
              onClick={connect}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              Connect Wallet
            </button>
          )}

          {/* Swap Button */}
          {signer && (
            <button
              onClick={handleSwap}
              disabled={loading || !amountIn}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Swapping...
                </div>
              ) : (
                'Swap Tokens'
              )}
            </button>
          )}
        </div>

        {/* Pool Info */}
        {userAddress && (
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">📊 Liquidity Pool</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">TKA Reserve:</span>
              <span className="text-emerald-400 font-mono">{parseFloat(reserve0).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">TKB Reserve:</span>
              <span className="text-emerald-400 font-mono">{parseFloat(reserve1).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Fee:</span>
              <span className="text-yellow-400">0.3%</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Local Testnet • Hardhat Node • EIP-2771 Ready
          </p>
        </div>
      </div>
    </div>
  );
}
