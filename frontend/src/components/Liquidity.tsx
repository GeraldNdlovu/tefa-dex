import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { TrendingUp, RefreshCw } from 'lucide-react';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
  "function getPool(address tokenA, address tokenB) view returns (address)"
];

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)",
  "function reserve0() view returns (uint256)",
  "function reserve1() view returns (uint256)"
];

interface LiquidityProps {
  account: string;
  provider: any;
  signer: any;
  onRefresh?: () => void;
}

export function Liquidity({ account, provider, signer, onRefresh }: LiquidityProps) {
  const [tkaBalance, setTkaBalance] = useState<string>('0');
  const [tkbBalance, setTkbBalance] = useState<string>('0');
  const [reserves, setReserves] = useState<{ tka: string; tkb: string }>({ tka: '0', tkb: '0' });
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<string>('0');

  useEffect(() => {
    if (account && provider) {
      loadData();
    }
  }, [account, provider]);

  const loadData = async () => {
    if (!provider || !account) return;
    await updateBalances();
    await updateReserves();
  };

  const updateBalances = async () => {
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
      const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, ERC20_ABI, provider);
      
      const tkaBal = await tokenA.balanceOf(account);
      const tkbBal = await tokenB.balanceOf(account);
      
      setTkaBalance(Number(ethers.formatEther(tkaBal)).toFixed(2));
      setTkbBalance(Number(ethers.formatEther(tkbBal)).toFixed(2));
    } catch (e) {
      console.error("Failed to update balances:", e);
    }
  };

  const updateReserves = async () => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const reserve0 = await pool.reserve0();
      const reserve1 = await pool.reserve1();
      
      const tkaReserve = Number(ethers.formatEther(reserve0));
      const tkbReserve = Number(ethers.formatEther(reserve1));
      
      setReserves({ tka: tkaReserve.toFixed(2), tkb: tkbReserve.toFixed(2) });
      
      const rate = tkaReserve > 0 ? tkbReserve / tkaReserve : 0;
      setExchangeRate(rate.toFixed(6));
    } catch (e) {
      console.error("Failed to update reserves:", e);
    }
  };

  const handleApproveToken = async (tokenAddress: string, amount: bigint) => {
    if (!signer) return;
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const allowance = await token.allowance(account, CONTRACT_ADDRESSES.ROUTER);
    if (allowance < amount) {
      const approveTx = await token.approve(CONTRACT_ADDRESSES.ROUTER, amount);
      await approveTx.wait();
    }
  };

  const handleAddLiquidity = async () => {
    if (!signer || !amountA || !amountB) return;
    setLoading(true);
    try {
      const amountANum = ethers.parseEther(amountA);
      const amountBNum = ethers.parseEther(amountB);
      
      await handleApproveToken(CONTRACT_ADDRESSES.TOKEN_A, amountANum);
      await handleApproveToken(CONTRACT_ADDRESSES.TOKEN_B, amountBNum);
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
      const tx = await router.addLiquidity(
        CONTRACT_ADDRESSES.TOKEN_A,
        CONTRACT_ADDRESSES.TOKEN_B,
        amountANum,
        amountBNum
      );
      await tx.wait();
      
      alert("✓ Liquidity added successfully!");
      setAmountA('');
      setAmountB('');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Add liquidity failed:", error);
      alert("Add liquidity failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (value && reserves.tka !== '0' && parseFloat(reserves.tka) > 0) {
      const ratio = parseFloat(reserves.tkb) / parseFloat(reserves.tka);
      const calculatedB = parseFloat(value) * ratio;
      setAmountB(calculatedB.toFixed(6));
    } else {
      setAmountB('');
    }
  };

  const tvl = parseFloat(reserves.tka) + parseFloat(reserves.tkb) * parseFloat(exchangeRate);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-semibold">Pool Statistics</span>
        </div>
        <div className="flex justify-between items-center">
          <div><p className="text-gray-400 text-xs">TKA Reserve</p><p className="text-white text-xl font-bold">{reserves.tka}</p></div>
          <div><p className="text-gray-400 text-xs">TKB Reserve</p><p className="text-white text-xl font-bold">{reserves.tkb}</p></div>
          <div><p className="text-gray-400 text-xs">TVL</p><p className="text-green-400 text-xl font-bold">${tvl.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="bg-black/30 rounded-2xl p-4 mb-4">
        <div className="flex justify-between mb-2"><span className="text-gray-400 text-sm">Add TKA</span><span className="text-gray-400 text-sm">Balance: {tkaBalance}</span></div>
        <div className="flex items-center justify-between">
          <input type="number" value={amountA} onChange={(e) => handleAmountAChange(e.target.value)} placeholder="0.0" className="bg-transparent text-white text-3xl w-full outline-none" step="0.1" />
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl"><div className="w-5 h-5 bg-purple-500 rounded-full"></div><span className="text-white font-medium">TKA</span></div>
        </div>
      </div>
      
      <div className="bg-black/30 rounded-2xl p-4 mb-6">
        <div className="flex justify-between mb-2"><span className="text-gray-400 text-sm">Add TKB</span><span className="text-gray-400 text-sm">Balance: {tkbBalance}</span></div>
        <div className="flex items-center justify-between">
          <input type="number" value={amountB} placeholder="0.0" className="bg-transparent text-white text-3xl w-full outline-none" readOnly />
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl"><div className="w-5 h-5 bg-blue-500 rounded-full"></div><span className="text-white font-medium">TKB</span></div>
        </div>
      </div>
      
      <button onClick={handleAddLiquidity} disabled={loading || !amountA || !amountB || parseFloat(amountA) <= 0} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
        {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Add Liquidity'}
      </button>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-center mb-2"><span className="text-gray-400 text-sm">Pool Info</span><button onClick={() => loadData()} className="text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button></div>
        <div className="flex justify-between text-sm"><span className="text-gray-300">Exchange Rate</span><span className="text-green-400">1 TKA = {exchangeRate} TKB</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="text-gray-300">Fee</span><span className="text-gray-300">0.3%</span></div>
        <div className="text-center text-xs text-gray-500 mt-4">Liquidity is permanent. Remove not supported in current version.</div>
      </div>
    </div>
  );
}
