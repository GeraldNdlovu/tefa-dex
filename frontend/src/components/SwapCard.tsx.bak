import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export function SwapCard() {
  const [amountIn, setAmountIn] = useState('1');
  const [amountOut, setAmountOut] = useState('0');
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  // Connect wallet
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
      
      setProvider(provider);
      setSigner(signer);
      setUserAddress(address);
      
      const network = await provider.getNetwork();
      console.log('Connected to network, chainId:', network.chainId);
      
      alert(`✅ Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed. Make sure Hardhat node is running.');
    }
  };

  // Calculate output amount with 0.3% fee
  useEffect(() => {
    if (amountIn && !isNaN(parseFloat(amountIn))) {
      const amount = parseFloat(amountIn);
      const fee = amount * 0.003; // 0.3% fee
      const output = amount - fee;
      setAmountOut(output.toFixed(6));
    }
  }, [amountIn]);

  // Normal swap with approval
  const handleSwap = async () => {
    if (!signer) {
      alert('Connect wallet first');
      return;
    }

    setLoading(true);
    try {
      // Router contract interface
      const router = new ethers.Contract(
        CONTRACT_ADDRESSES.ROUTER,
        ['function swap(address,address,uint256) returns (uint256)'],
        signer
      );

      // Token A contract for approval
      const tokenA = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_A,
        [
          'function approve(address,uint256) returns (bool)',
          'function balanceOf(address) view returns (uint256)'
        ],
        signer
      );

      // Check balance first
      const balance = await tokenA.balanceOf(userAddress);
      const amountInWei = ethers.parseEther(amountIn);
      
      if (balance < amountInWei) {
        alert(`Insufficient balance. You have ${ethers.formatEther(balance)} TKA`);
        setLoading(false);
        return;
      }

      console.log('Approving router to spend tokens...');
      const approveTx = await tokenA.approve(CONTRACT_ADDRESSES.ROUTER, amountInWei);
      await approveTx.wait();
      console.log('✅ Approved');

      console.log('Executing swap...');
      const tx = await router.swap(
        CONTRACT_ADDRESSES.TOKEN_A,
        CONTRACT_ADDRESSES.TOKEN_B,
        amountInWei
      );
      const receipt = await tx.wait();
      
      console.log('Swap receipt:', receipt);
      alert(`✅ Swap successful! Transaction: ${receipt.hash.slice(0, 10)}...`);
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      if (error.message?.includes('insufficient')) {
        alert('Insufficient balance or approval failed.');
      } else if (error.message?.includes('user rejected')) {
        alert('Transaction rejected.');
      } else {
        alert('Swap failed. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gasless swap - prepares signature for relayer
  const handleGaslessSwap = async () => {
    if (!signer) {
      alert('Connect wallet first');
      return;
    }

    setLoading(true);
    try {
      const amountInWei = ethers.parseEther(amountIn);
      const nonce = await provider!.getTransactionCount(userAddress);
      
      // EIP-712 domain data
      const domain = {
        name: 'TEFA DEX',
        version: '1',
        chainId: 31337, // Hardhat local chain ID
        verifyingContract: CONTRACT_ADDRESSES.ROUTER
      };
      
      // Typed data structure for swap
      const types = {
        Swap: [
          { name: 'user', type: 'address' },
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      };
      
      const value = {
        user: userAddress,
        tokenIn: CONTRACT_ADDRESSES.TOKEN_A,
        tokenOut: CONTRACT_ADDRESSES.TOKEN_B,
        amountIn: amountInWei,
        nonce: nonce
      };
      
      // Sign the typed data (this costs NO GAS!)
      const signature = await signer.signTypedData(domain, types, value);
      
      console.log('📝 Gasless signature created:', signature);
      console.log('Domain:', domain);
      console.log('Value:', value);
      
      alert(
        `🔥 Gasless signature created!\n\n` +
        `Signature: ${signature.slice(0, 30)}...\n\n` +
        `In production, this would be sent to a relayer for free execution.\n\n` +
        `The relayer would submit this signature to the TrustedForwarder contract.\n\n` +
        `For now, this demonstrates the gasless flow without spending gas!`
      );
      
      // In production, you would send this to your relayer API:
      // await fetch('/api/relay', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ signature, domain, types, value })
      // });
      
    } catch (error: any) {
      console.error('Gasless preparation failed:', error);
      if (error.message?.includes('user rejected')) {
        alert('Signature rejected.');
      } else {
        alert('Failed to create gasless transaction. Check console.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-900">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            <span className="text-3xl">🔄</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            TEFA DEX
          </h1>
          <p className="text-zinc-400 mt-2">Gasless • Multi-Chain • Beautiful</p>
          {userAddress && (
            <p className="text-xs text-green-400 mt-2 font-mono">
              {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
            </p>
          )}
        </div>

        {/* Swap Interface */}
        <div className="space-y-6">
          {/* From Token */}
          <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700">
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-zinc-400">From</span>
              <span className="text-emerald-400 font-mono">TKA</span>
            </div>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="w-full bg-transparent text-3xl outline-none text-white"
              placeholder="0.0"
              disabled={loading}
              step="any"
            />
            <div className="text-xs text-zinc-500 mt-2">
              Balance: Check in console
            </div>
          </div>

          {/* Arrow */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/30"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-purple-600 rounded-full p-2">
                <span className="text-2xl">↓</span>
              </div>
            </div>
          </div>

          {/* To Token */}
          <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700">
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-zinc-400">To</span>
              <span className="text-emerald-400 font-mono">TKB</span>
            </div>
            <div className="text-3xl text-white font-mono">
              {loading ? '...' : amountOut}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              ≈ 0.3% fee included
            </div>
          </div>

          {/* Connect Button */}
          {!signer && (
            <button
              onClick={connect}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white hover:opacity-90 transition-all"
            >
              Connect Wallet
            </button>
          )}

          {/* Swap Buttons */}
          {signer && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSwap}
                disabled={loading}
                className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Swapping...' : '🔄 Normal Swap'}
              </button>
              <button
                onClick={handleGaslessSwap}
                disabled={loading}
                className="py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Preparing...' : '⛽ Gasless Swap'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            Local Testnet • Hardhat Node • EIP-2771 Ready
          </p>
          {signer && (
            <p className="text-xs text-green-500 mt-2 animate-pulse">
              ✅ Ready to trade
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
