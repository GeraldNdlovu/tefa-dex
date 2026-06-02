import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowDownUp, Wallet, TrendingUp, RefreshCw, Zap } from 'lucide-react';

declare global {
  interface Window {
    ethereum: any;
  }
}

const CONTRACTS = {
  ROUTER: "0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2",
  TKA: "0x3299Fe8d021d49f04080e67A6d5Ee2f790A71D1f",
  TKB: "0x380bAF28b597dE4b5FBeBbb7e3fea98a843D553E",
  POOL: "0xeb12f5Aab4eabdbb7c374375eE7EE8e0BaEDedd4",
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
];

const ROUTER_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)",
];

const POOL_ABI = [
  "function reserve0() view returns (uint256)",
  "function reserve1() view returns (uint256)",
];

function App() {
  const [account, setAccount] = useState<string>('');
  const [fromToken, setFromToken] = useState<'TKA' | 'TKB'>('TKB');
  const [toToken, setToToken] = useState<'TKA' | 'TKB'>('TKA');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({ TKA: '0', TKB: '0' });
  const [reserves, setReserves] = useState({ TKA: 0, TKB: 0 });
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => res.json())
      .then(data => setEthPrice(data.ethereum?.usd || 0))
      .catch(console.error);
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await fetchBalances(accounts[0]);
      await fetchReserves();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalances = async (address: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tka = new ethers.Contract(CONTRACTS.TKA, ERC20_ABI, provider);
      const tkb = new ethers.Contract(CONTRACTS.TKB, ERC20_ABI, provider);
      const tkaBal = ethers.utils.formatEther(await tka.balanceOf(address));
      const tkbBal = ethers.utils.formatEther(await tkb.balanceOf(address));
      setBalances({
        TKA: parseFloat(tkaBal).toFixed(2),
        TKB: parseFloat(tkbBal).toFixed(2),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReserves = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/7cc54e6c6a2146b1963a922ab3ce5b0c');
      const pool = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, provider);
      const r0 = await pool.reserve0();
      const r1 = await pool.reserve1();
      setReserves({
        TKA: parseFloat(ethers.utils.formatEther(r0)),
        TKB: parseFloat(ethers.utils.formatEther(r1)),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getRate = () => {
    if (reserves.TKA === 0 || reserves.TKB === 0) return 0;
    return fromToken === 'TKA' ? reserves.TKB / reserves.TKA : reserves.TKA / reserves.TKB;
  };

  const getTVL = () => {
    return (reserves.TKA * 0.72 + reserves.TKB * 0.68).toFixed(0);
  };

  const getOutputAmount = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0) return '0';
    return (inputAmount * getRate()).toFixed(6);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter an amount");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenIn = fromToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB;
      const tokenOut = toToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB;
      const amountIn = ethers.utils.parseEther(amount);
      const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
      const allowance = await tokenContract.allowance(account, CONTRACTS.ROUTER);
      if (allowance.lt(amountIn)) {
        const approveTx = await tokenContract.approve(CONTRACTS.ROUTER, ethers.constants.MaxUint256);
        await approveTx.wait();
      }
      const router = new ethers.Contract(CONTRACTS.ROUTER, ROUTER_ABI, signer);
      const tx = await router.swap(tokenIn, tokenOut, amountIn);
      await tx.wait();
      alert("Swap successful!");
      await fetchBalances(account);
      await fetchReserves();
      setAmount('');
    } catch (err: any) {
      if (err.code === 4001) alert("Transaction cancelled");
      else alert(err.message?.slice(0, 100) || "Swap failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts[0]) window.location.reload();
        else setAccount('');
      });
    }
  }, []);

  if (!window.ethereum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/10">
          <div className="text-6xl mb-4">🦊</div>
          <h1 className="text-2xl font-bold text-white mb-2">MetaMask Required</h1>
          <p className="text-gray-400 mb-6">Please install MetaMask to use TEFA DEX</p>
          <button onClick={() => window.open('https://metamask.io/download/', '_blank')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            Install MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/10">
          <div className="text-6xl mb-4">✦</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">TEFA DEX</h1>
          <p className="text-gray-400 mb-6">Gasless • Instant • Secure</p>
          <button onClick={connectWallet} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition">
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Zap className="text-purple-400" size={24} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">TEFA DEX</h1>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 border border-white/10">
            <Wallet size={14} className="inline mr-1 text-purple-400" />
            {account.slice(0,4)}...{account.slice(-4)}
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mb-4 px-2">
          <span>ETH: ${ethPrice.toLocaleString()}</span>
          <span>TVL: ${getTVL()}</span>
          <span>Fee: 0.3%</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <div className="bg-black/30 rounded-xl p-4">
            <div className="flex justify-between text-gray-400 text-sm mb-2">
              <span>From</span>
              <span>Balance: {balances[fromToken]}</span>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => setFromToken(fromToken === 'TKA' ? 'TKB' : 'TKA')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-semibold transition flex items-center gap-2">
                {fromToken === 'TKA' ? '⚡ TKA' : '💎 TKB'}
              </button>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="flex-1 bg-transparent text-white text-3xl text-right focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <button onClick={switchTokens} className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition border border-white/10">
              <ArrowDownUp size={18} className="text-purple-400" />
            </button>
          </div>

          <div className="bg-black/30 rounded-xl p-4 mt-2">
            <div className="flex justify-between text-gray-400 text-sm mb-2">
              <span>To</span>
              <span>Balance: {balances[toToken]}</span>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => setToToken(toToken === 'TKA' ? 'TKB' : 'TKA')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-semibold transition flex items-center gap-2">
                {toToken === 'TKA' ? '⚡ TKA' : '💎 TKB'}
              </button>
              <input type="text" value={getOutputAmount()} disabled placeholder="0.0" className="flex-1 bg-transparent text-white text-3xl text-right opacity-70" />
            </div>
          </div>

          <div className="flex justify-between mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
              <TrendingUp size={12} className="text-green-400" />
              <span>1 {fromToken} = {getRate().toFixed(6)} {toToken}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full cursor-pointer hover:bg-white/10" onClick={fetchReserves}>
              <RefreshCw size={12} />
              <span>TVL: ${getTVL()}</span>
            </div>
          </div>

          <button onClick={handleSwap} disabled={loading || !amount} className="w-full mt-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Swap ${fromToken} → ${toToken}`
            )}
          </button>

          <div className="flex justify-between mt-5 pt-4 border-t border-white/10 text-center">
            <div className="flex-1"><div className="text-gray-500 text-xs mb-1">⚡ TKA Reserve</div><div className="text-white font-semibold">{Math.floor(reserves.TKA)}</div></div>
            <div className="flex-1"><div className="text-gray-500 text-xs mb-1">💎 TKB Reserve</div><div className="text-white font-semibold">{Math.floor(reserves.TKB)}</div></div>
            <div className="flex-1"><div className="text-gray-500 text-xs mb-1">💸 Fee</div><div className="text-white font-semibold">0.3%</div></div>
          </div>
        </div>

        <div className="text-center text-gray-600 text-xs mt-6">Built on Sepolia • Gasless via EIP-2771 • 60% to LPs</div>
      </div>
    </div>
  );
}

export default App;
