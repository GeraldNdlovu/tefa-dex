import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RELAYER_URL } from './config/contracts';
import { ArrowDownUp, Wallet, Settings, RefreshCw, Zap, Shield, TrendingUp } from 'lucide-react';

declare global {
  interface Window {
    ethereum: any;
  }
}

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const ROUTER_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256)",
  "function getPool(address tokenA, address tokenB) view returns (address)"
];

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)"
];

const FORWARDER_ABI = [
  "function nonces(address) view returns (uint256)"
];

function App() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [tkaBalance, setTkaBalance] = useState<string>('0');
  const [tkbBalance, setTkbBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useGasless, setUseGasless] = useState<boolean>(false);
  const [routerApproved, setRouterApproved] = useState<boolean>(false);
  const [reserves, setReserves] = useState<{ tka: string; tkb: string }>({ tka: '0', tkb: '0' });
  const [exchangeRate, setExchangeRate] = useState<string>('0');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();
        setAccount(address);
        await updateBalances(address, provider);
        await checkGaslessEligibility(address, provider);
        await checkAllowance(address, provider);
        await updateReserves(provider);
      }
    }
  };

  const updateReserves = async (provider: ethers.BrowserProvider) => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      setReserves({
        tka: ethers.formatEther(reserve0),
        tkb: ethers.formatEther(reserve1)
      });
      const rate = Number(ethers.formatEther(reserve1)) / Number(ethers.formatEther(reserve0));
      setExchangeRate(rate.toFixed(6));
    } catch (e) {
      console.error("Failed to get reserves:", e);
    }
  };

  const checkGaslessEligibility = async (address: string, provider: ethers.BrowserProvider) => {
    const balance = await provider.getBalance(address);
    const ethBalanceNum = parseFloat(ethers.formatEther(balance));
    setEthBalance(ethBalanceNum.toFixed(4));
    setUseGasless(ethBalanceNum < 0.001);
  };

  const checkAllowance = async (address: string, provider: ethers.BrowserProvider) => {
    const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
    const allowance = await tokenA.allowance(address, CONTRACT_ADDRESSES.ROUTER);
    setRouterApproved(allowance >= ethers.parseEther("10"));
  };

  const updateBalances = async (address: string, provider: ethers.BrowserProvider) => {
    const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
    const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, ERC20_ABI, provider);
    
    const tkaBalance = await tokenA.balanceOf(address);
    const tkbBalance = await tokenB.balanceOf(address);
    const ethBal = await provider.getBalance(address);
    
    setTkaBalance(Number(ethers.formatEther(tkaBalance)).toFixed(2));
    setTkbBalance(Number(ethers.formatEther(tkbBalance)).toFixed(2));
    setEthBalance(Number(ethers.formatEther(ethBal)).toFixed(4));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();
        setAccount(address);
        await updateBalances(address, provider);
        await checkGaslessEligibility(address, provider);
        await checkAllowance(address, provider);
        await updateReserves(provider);
        
        // Listen for network changes
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', () => window.location.reload());
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleApprove = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, signer);
      const approveAmount = ethers.parseEther("10000");
      const approveTx = await tokenA.approve(CONTRACT_ADDRESSES.ROUTER, approveAmount);
      await approveTx.wait();
      await checkAllowance(account, provider!);
      alert("✓ Router approved!");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!signer || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    
    try {
      const swapAmount = ethers.parseEther(amount);
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, signer);
      const allowance = await tokenA.allowance(account, CONTRACT_ADDRESSES.ROUTER);
      
      if (allowance < swapAmount) {
        alert("Please approve the router first");
        setLoading(false);
        return;
      }
      
      if (useGasless) {
        await handleGaslessSwap(swapAmount);
      } else {
        const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
        const tx = await router.swap(
          CONTRACT_ADDRESSES.TOKEN_A,
          CONTRACT_ADDRESSES.TOKEN_B,
          swapAmount
        );
        await tx.wait();
      }
      
      await updateBalances(account, provider!);
      await updateReserves(provider!);
      setAmount('');
      alert("✓ Swap successful!");
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Swap failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGaslessSwap = async (swapAmount: bigint) => {
    const forwarder = new ethers.Contract(CONTRACT_ADDRESSES.FORWARDER, FORWARDER_ABI, signer!);
    const nonce = await forwarder.nonces(account);
    
    const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer!);
    const swapData = router.interface.encodeFunctionData("swap", [
      CONTRACT_ADDRESSES.TOKEN_A,
      CONTRACT_ADDRESSES.TOKEN_B,
      swapAmount
    ]);
    
    const domain = {
      name: "TrustedForwarder",
      version: "1",
      chainId: 11155111,
      verifyingContract: CONTRACT_ADDRESSES.FORWARDER
    };
    
    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" }
      ]
    };
    
    const message = {
      from: account,
      to: CONTRACT_ADDRESSES.ROUTER,
      value: 0,
      gas: 500000,
      nonce: nonce,
      data: swapData
    };
    
    const signature = await (signer as any).signTypedData(domain, types, message);
    
    const response = await fetch(RELAYER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        value: message.value.toString(),
        gas: message.gas.toString(),
        nonce: message.nonce.toString(),
        data: message.data,
        signature: signature
      })
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const getEstimatedOutput = () => {
    if (!amount || parseFloat(amount) === 0) return '0';
    const input = parseFloat(amount);
    const rate = parseFloat(exchangeRate);
    return (input * rate).toFixed(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">TEFA DEX</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                {useGasless ? 'Gasless Mode' : 'Standard'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition">
                <Settings className="w-5 h-5" />
              </button>
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-white font-medium transition"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">TKA Balance</p>
            <p className="text-white text-xl font-bold">{tkaBalance}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">TKB Balance</p>
            <p className="text-white text-xl font-bold">{tkbBalance}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">ETH Balance</p>
            <p className="text-white text-xl font-bold">{ethBalance}</p>
          </div>
        </div>

        {/* Swap Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">Swap Tokens</h2>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400">1 TKA ≈ {exchangeRate} TKB</span>
            </div>
          </div>

          {/* You Pay */}
          <div className="bg-black/30 rounded-2xl p-4 mb-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">You Pay</span>
              <span className="text-gray-400 text-sm">Balance: {tkaBalance}</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-white text-3xl w-full outline-none"
                step="0.1"
              />
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                <span className="text-white font-medium">TKA</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-gray-800 rounded-full p-1.5">
              <ArrowDownUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* You Receive */}
          <div className="bg-black/30 rounded-2xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">You Receive</span>
              <span className="text-gray-400 text-sm">Balance: {tkbBalance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-3xl">{getEstimatedOutput()}</span>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                <span className="text-white font-medium">TKB</span>
              </div>
            </div>
          </div>

          {/* Gasless Info */}
          {useGasless && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Gas-free mode active</span>
              </div>
              <p className="text-yellow-400/70 text-xs mt-1">Your ETH balance is low. Using relayer for gas.</p>
            </div>
          )}

          {/* Actions */}
          {!routerApproved ? (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Approve Router'}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className={`w-full font-semibold py-4 rounded-xl transition flex items-center justify-center space-x-2 ${
                loading || !amount || parseFloat(amount) <= 0
                  ? 'bg-gray-600 cursor-not-allowed'
                  : useGasless
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              } text-white`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>{useGasless ? 'Swap (Gas-Free)' : 'Swap'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Liquidity Info */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Pool Liquidity</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">TKA Reserve</span>
            <span className="text-white font-medium">{reserves.tka}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-300">TKB Reserve</span>
            <span className="text-white font-medium">{reserves.tkb}</span>
          </div>
          <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
            <span className="text-gray-300">Exchange Rate</span>
            <span className="text-green-400 font-medium">1 TKA = {exchangeRate} TKB</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Built on Sepolia Testnet | Gasless via EIP-2771
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
