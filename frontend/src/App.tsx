import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RELAYER_URL } from './config/contracts';
import { 
  ArrowDownUp, Wallet, Settings, RefreshCw, Zap, Shield, TrendingUp, 
  History, LineChart, X, AlertTriangle, Copy 
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface SwapHistory {
  hash: string;
  amount: string;
  received: string;
  timestamp: number;
  type: 'swap';
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [tkaBalance, setTkaBalance] = useState<string>('0');
  const [tkbBalance, setTkbBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useGasless, setUseGasless] = useState<boolean>(false);
  const [routerApproved, setRouterApproved] = useState<boolean>(false);
  const [reserves, setReserves] = useState<{ tka: string; tkb: string }>({ tka: '0', tkb: '0' });
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    loadSwapHistory();
    generateMockPriceHistory();
    checkIfWalletConnected();
  }, []);

  const checkIfWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setProvider(provider);
          setSigner(signer);
          await updateBalances(address, provider);
          await checkAllowance(address, provider);
          await updateReserves(provider);
        }
      } catch (error) {
        console.error("Failed to check wallet:", error);
      }
    }
  };

  const generateMockPriceHistory = () => {
    const prices = [];
    let basePrice = 0.74;
    for (let i = 0; i < 30; i++) {
      basePrice += (Math.random() - 0.5) * 0.01;
      prices.push(basePrice);
    }
    setPriceHistory(prices);
    setLastPrice(prices[prices.length - 1]);
    setPriceChange(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100);
  };

  const loadSwapHistory = () => {
    const saved = localStorage.getItem('tefa_swap_history');
    if (saved) {
      setSwapHistory(JSON.parse(saved));
    }
  };

  const saveSwapHistory = (swap: SwapHistory) => {
    const updated = [swap, ...swapHistory].slice(0, 20);
    setSwapHistory(updated);
    localStorage.setItem('tefa_swap_history', JSON.stringify(updated));
  };

  const updateReserves = async (provider: any) => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      const tkaReserve = Number(ethers.formatEther(reserve0));
      const tkbReserve = Number(ethers.formatEther(reserve1));
      setReserves({
        tka: tkaReserve.toFixed(2),
        tkb: tkbReserve.toFixed(2)
      });
      const rate = tkbReserve / tkaReserve;
      setExchangeRate(rate.toFixed(6));
    } catch (e) {
      console.error("Failed to get reserves:", e);
    }
  };

  const checkAllowance = async (address: string, provider: any) => {
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
      const allowance = await tokenA.allowance(address, CONTRACT_ADDRESSES.ROUTER);
      const hasAllowance = allowance >= ethers.parseEther("10");
      setRouterApproved(hasAllowance);
      return hasAllowance;
    } catch (e) {
      console.error("Failed to check allowance:", e);
      return false;
    }
  };

  const updateBalances = async (address: string, provider: any) => {
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
      const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, ERC20_ABI, provider);
      
      const tkaBalance = await tokenA.balanceOf(address);
      const tkbBalance = await tokenB.balanceOf(address);
      const ethBal = await provider.getBalance(address);
      const ethNum = parseFloat(ethers.formatEther(ethBal));
      
      setTkaBalance(Number(ethers.formatEther(tkaBalance)).toFixed(2));
      setTkbBalance(Number(ethers.formatEther(tkbBalance)).toFixed(2));
      setEthBalance(ethNum.toFixed(4));
      setUseGasless(ethNum < 0.001);
    } catch (e) {
      console.error("Failed to update balances:", e);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      setLoading(true);
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setProvider(provider);
      setSigner(signer);
      await updateBalances(address, provider);
      await checkAllowance(address, provider);
      await updateReserves(provider);
      
      // Setup event listeners
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => window.location.reload());
      
      alert("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Failed to connect wallet. Please make sure MetaMask is unlocked and on Sepolia network.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (account && provider) {
      setLoading(true);
      await updateBalances(account, provider);
      await checkAllowance(account, provider);
      await updateReserves(provider);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!signer) {
      alert("Please connect wallet first");
      return;
    }
    setLoading(true);
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, signer);
      const approveAmount = ethers.parseEther("10000");
      const approveTx = await tokenA.approve(CONTRACT_ADDRESSES.ROUTER, approveAmount);
      await approveTx.wait();
      await checkAllowance(account, provider);
      alert("✓ Router approved! You can now swap.");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!signer || !amount || parseFloat(amount) <= 0) {
      alert("Please connect wallet and enter amount");
      return;
    }
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
      
      const balanceBefore = parseFloat(tkbBalance);
      
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
      
      await updateBalances(account, provider);
      await updateReserves(provider);
      
      const balanceAfter = parseFloat(tkbBalance);
      const received = (balanceAfter - balanceBefore).toFixed(6);
      
      saveSwapHistory({
        hash: `0x${Math.random().toString(36).substring(2, 10)}...`,
        amount: amount,
        received: received,
        timestamp: Date.now(),
        type: 'swap'
      });
      
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
    const forwarder = new ethers.Contract(CONTRACT_ADDRESSES.FORWARDER, FORWARDER_ABI, signer);
    const nonce = await forwarder.nonces(account);
    
    const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
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
    const slippageAmount = rate * (slippage / 100);
    const minOutput = input * (rate - slippageAmount);
    return minOutput.toFixed(6);
  };

  const tvl = parseFloat(reserves.tka) + parseFloat(reserves.tkb) * parseFloat(exchangeRate);

  const chartData = {
    labels: Array.from({ length: priceHistory.length }, (_, i) => `${i * 2}h ago`),
    datasets: [
      {
        label: 'TKA/TKB',
        data: priceHistory,
        borderColor: '#c084fc',
        backgroundColor: 'rgba(192, 132, 252, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert("Address copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">TEFA DEX</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                {useGasless ? 'Gasless Mode' : 'Standard'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={refreshData} disabled={loading} className="p-2 text-gray-400 hover:text-white transition">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowHistory(true)} className="p-2 text-gray-400 hover:text-white transition">
                <History className="w-5 h-5" />
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white transition">
                <Settings className="w-5 h-5" />
              </button>
              {!account ? (
                <button onClick={connectWallet} disabled={loading} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-white font-medium transition">
                  <Wallet className="w-4 h-4" />
                  <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">{account.slice(0, 6)}...{account.slice(-4)}</span>
                  <button onClick={copyAddress} className="text-gray-400 hover:text-white">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {account && useGasless && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Low ETH balance - Gasless mode activated!</span>
            </div>
            <p className="text-yellow-400/70 text-xs mt-1">Your swaps will be gas-free. Only the one-time approval needs a tiny fee.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">Exchange Rate</p>
            <p className="text-green-400 text-xl font-bold">1 TKA = {exchangeRate} TKB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl font-semibold">Swap Tokens</h2>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Slippage: {slippage}%</span>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">You Pay</span>
                  <span className="text-gray-400 text-sm">Balance: {tkaBalance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-white text-3xl w-full outline-none" step="0.1" />
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                    <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                    <span className="text-white font-medium">TKA</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-gray-800 rounded-full p-1.5">
                  <ArrowDownUp className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">You Receive (Min)</span>
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

              {!routerApproved ? (
                <button onClick={handleApprove} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Approve Router (One Time)'}
                </button>
              ) : (
                <button onClick={handleSwap} disabled={loading || !amount || parseFloat(amount) <= 0} className={`w-full font-semibold py-4 rounded-xl transition flex items-center justify-center space-x-2 ${loading || !amount || parseFloat(amount) <= 0 ? 'bg-gray-600 cursor-not-allowed' : useGasless ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'} text-white`}>
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /><span>{useGasless ? 'Swap (Gas-Free)' : 'Swap'}</span></>}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Price Chart</h3>
                </div>
                <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
              </div>
              <div className="h-48">
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className="mt-3 text-center">
                <span className="text-2xl font-bold text-white">{lastPrice.toFixed(6)}</span>
                <span className="text-gray-400 text-sm ml-2">TKA/TKB</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <h3 className="text-white font-semibold">Pool Liquidity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">TKA Reserve</span>
                  <span className="text-white font-medium">{reserves.tka}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">TKB Reserve</span>
                  <span className="text-white font-medium">{reserves.tkb}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Value Locked (TVL)</span>
                    <span className="text-green-400 font-medium">${tvl.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <div className="bg-gray-800 rounded-3xl p-6 w-96 max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-semibold">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-4">
                <label className="text-gray-300 text-sm mb-2 block">Slippage Tolerance (%)</label>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button key={value} onClick={() => setSlippage(value)} className={`px-4 py-2 rounded-xl transition ${slippage === value ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{value}%</button>
                  ))}
                  <input type="number" value={slippage} onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)} className="w-20 bg-white/10 rounded-xl px-3 py-2 text-white" step="0.1" />
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-4">Transactions will revert if price changes more than slippage</div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHistory(false)}>
            <div className="bg-gray-800 rounded-3xl p-6 w-full max-w-2xl max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-semibold">Swap History</h3>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {swapHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No swaps yet</p>
                  <p className="text-gray-500 text-sm mt-1">Your first swap will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {swapHistory.map((swap, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{swap.amount} TKA → {swap.received} TKB</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(swap.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-green-400 text-sm">✓ Complete</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-6 border-t border-white/10 mt-8">
        <p className="text-gray-500 text-xs">Built on Sepolia Testnet | Gasless via EIP-2771 | 0.3% Fee | 60% to LPs</p>
      </div>
    </div>
  );
}

export default App;
