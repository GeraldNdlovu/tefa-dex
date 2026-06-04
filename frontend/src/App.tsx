import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import { CONTRACT_ADDRESSES } from './config/contracts';

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const ROUTER_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256)",
  "function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) view returns (uint256)",
  "function getPool(address, address) view returns (address)",
];

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)",
  "function token0() view returns (address)",
];

function App() {
  const [account, setAccount] = useState('');
  const [fromToken, setFromToken] = useState('TKB');
  const [toToken, setToToken] = useState('TKA');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({ TKA: '0', TKB: '0' });
  const [reserves, setReserves] = useState({ TKA: 0, TKB: 0 });
  const [exchangeRate, setExchangeRate] = useState(0);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      toast.success("Wallet connected!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet");
    }
  };

  const getProvider = () => {
    return new ethers.providers.Web3Provider(window.ethereum);
  };

  const fetchBalances = async (address) => {
    if (!window.ethereum) return;
    try {
      const provider = getProvider();
      const tka = new ethers.Contract(CONTRACT_ADDRESSES.TKA, ERC20_ABI, provider);
      const tkb = new ethers.Contract(CONTRACT_ADDRESSES.TKB, ERC20_ABI, provider);
      
      const tkaBal = await tka.balanceOf(address);
      const tkbBal = await tkb.balanceOf(address);
      
      setBalances({
        TKA: ethers.utils.formatEther(tkaBal),
        TKB: ethers.utils.formatEther(tkbBal),
      });
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  const fetchReservesAndRate = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c');
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      
      const reservesData = await pool.getReserves();
      const token0 = await pool.token0();
      
      const tkaAddress = CONTRACT_ADDRESSES.TKA.toLowerCase();
      const token0Lower = token0.toLowerCase();
      
      let tkaReserve, tkbReserve;
      if (token0Lower === tkaAddress) {
        tkaReserve = parseFloat(ethers.utils.formatEther(reservesData[0]));
        tkbReserve = parseFloat(ethers.utils.formatEther(reservesData[1]));
      } else {
        tkaReserve = parseFloat(ethers.utils.formatEther(reservesData[1]));
        tkbReserve = parseFloat(ethers.utils.formatEther(reservesData[0]));
      }
      
      setReserves({ TKA: tkaReserve, TKB: tkbReserve });
      const rate = tkbReserve > 0 ? tkaReserve / tkbReserve : 0;
      setExchangeRate(rate);
      
    } catch (err) {
      console.error("Error fetching reserves:", err);
    }
  };

  useEffect(() => {
    if (account) {
      fetchBalances(account);
      fetchReservesAndRate();
      const interval = setInterval(() => {
        fetchReservesAndRate();
        fetchBalances(account);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [account]);

  useEffect(() => {
    fetchReservesAndRate();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts[0]) {
          setAccount(accounts[0]);
          fetchBalances(accounts[0]);
          toast.info("Account changed");
        } else {
          setAccount('');
        }
      });
    }
  }, []);

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    if (value && exchangeRate > 0) {
      const calculated = parseFloat(value) * exchangeRate;
      setToAmount(calculated.toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);
    if (value && exchangeRate > 0) {
      const calculated = parseFloat(value) / exchangeRate;
      setFromAmount(calculated.toFixed(6));
    } else {
      setFromAmount('');
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };

  const handleSwap = async () => {
    if (!account) {
      connectWallet();
      return;
    }
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    
    setLoading(true);
    const swapPromise = (async () => {
      const provider = getProvider();
      const signer = provider.getSigner();
      
      const tokenIn = fromToken === 'TKA' ? CONTRACT_ADDRESSES.TKA : CONTRACT_ADDRESSES.TKB;
      const tokenOut = toToken === 'TKA' ? CONTRACT_ADDRESSES.TKA : CONTRACT_ADDRESSES.TKB;
      const amountIn = ethers.utils.parseEther(fromAmount);
      
      const routerContract = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, provider);
      let expectedOut;
      try {
        expectedOut = await routerContract.getAmountOut(amountIn, tokenIn, tokenOut);
      } catch (e) {
        const amountInNum = parseFloat(fromAmount);
        const reserveIn = fromToken === 'TKB' ? reserves.TKB : reserves.TKA;
        const reserveOut = fromToken === 'TKB' ? reserves.TKA : reserves.TKB;
        const amountInWithFee = amountInNum * 0.997;
        expectedOut = ethers.utils.parseEther(((amountInWithFee * reserveOut) / (reserveIn + amountInWithFee)).toFixed(18));
      }
      
      const amountOutMin = expectedOut.mul(95).div(100);
      const deadline = Math.floor(Date.now() / 1000) + 1200;
      
      const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
      const allowance = await tokenContract.allowance(account, CONTRACT_ADDRESSES.ROUTER);
      
      if (allowance.lt(amountIn)) {
        toast.loading("Approving router to spend tokens...", { id: "approve" });
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.ROUTER, ethers.constants.MaxUint256);
        await approveTx.wait();
        toast.success("Router approved!", { id: "approve" });
      }
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
      const tx = await router.swap(tokenIn, tokenOut, amountIn, amountOutMin, deadline);
      await tx.wait();
      
      await fetchBalances(account);
      await fetchReservesAndRate();
      setFromAmount('');
      setToAmount('');
      
      return tx.hash;
    })();

    toast.promise(swapPromise, {
      loading: 'Swapping tokens...',
      success: (txHash) => `Swap successful! Tx: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
      error: (err) => err.message || 'Swap failed'
    });

    try {
      await swapPromise;
    } catch (err) {
      console.error("Swap error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!window.ethereum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">MetaMask Required</h1>
          <button onClick={() => window.open('https://metamask.io/download/', '_blank')} className="bg-blue-500 text-white px-6 py-2 rounded-lg">
            Install MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">TEFA DEX</h1>
          <p className="text-gray-400 mb-6">Gasless • Instant • Secure</p>
          <button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          border: '1px solid #374151'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }} />
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TEFA DEX</h1>
          <div className="bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-300 border border-gray-700">
            {account.slice(0,6)}...{account.slice(-4)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between text-gray-400 text-sm mb-2">
              <span>From</span>
              <span>Balance: {parseFloat(balances[fromToken]).toFixed(4)}</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-gray-800 rounded-xl px-4 py-2 text-white font-semibold">
                {fromToken}
              </div>
              <input 
                type="number" 
                value={fromAmount} 
                onChange={(e) => handleFromAmountChange(e.target.value)} 
                placeholder="0.0" 
                className="flex-1 bg-transparent text-white text-2xl text-right focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <button onClick={switchTokens} className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition">
              ↓↑
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 mt-2">
            <div className="flex justify-between text-gray-400 text-sm mb-2">
              <span>To</span>
              <span>Balance: {parseFloat(balances[toToken]).toFixed(4)}</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-gray-800 rounded-xl px-4 py-2 text-white font-semibold">
                {toToken}
              </div>
              <input 
                type="number" 
                value={toAmount} 
                onChange={(e) => handleToAmountChange(e.target.value)} 
                placeholder="0.0" 
                className="flex-1 bg-transparent text-white text-2xl text-right focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4 text-sm text-gray-400">
            <span>1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}</span>
            <span>Fee: 0.3%</span>
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t border-gray-700 text-center text-xs">
            <div className="flex-1">
              <div className="text-gray-500">TKA Reserve</div>
              <div className="text-white font-semibold">{Math.floor(reserves.TKA)}</div>
            </div>
            <div className="flex-1">
              <div className="text-gray-500">TKB Reserve</div>
              <div className="text-white font-semibold">{Math.floor(reserves.TKB)}</div>
            </div>
          </div>

          <button 
            onClick={handleSwap} 
            disabled={loading || !fromAmount} 
            className="w-full mt-5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "Processing..." : `Swap ${fromToken} → ${toToken}`}
          </button>

          <div className="text-center text-gray-500 text-xs mt-4">
            Gasless • Powered by EIP-2771 • 0.3% fee
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
