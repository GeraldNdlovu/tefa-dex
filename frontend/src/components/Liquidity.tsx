import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { Plus, Minus, TrendingUp, RefreshCw } from 'lucide-react';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) external",
  "function getPool(address tokenA, address tokenB) view returns (address)"
];

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)",
  "function lpShares(address) view returns (uint256)",
  "function totalLpShares() view returns (uint256)",
  "function getLpInfo(address) view returns (uint256, uint256, uint256)"
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
  const [lpShares, setLpShares] = useState<string>('0');
  const [totalLpShares, setTotalLpShares] = useState<string>('0');
  const [poolShare, setPoolShare] = useState<string>('0');
  const [reserves, setReserves] = useState<{ tka: string; tkb: string }>({ tka: '0', tkb: '0' });
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [removeShares, setRemoveShares] = useState<string>('');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
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
    await updatePoolInfo();
    await updateLpInfo();
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

  const updatePoolInfo = async () => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      const totalShares = await pool.totalLpShares();
      
      const tkaReserve = Number(ethers.formatEther(reserve0));
      const tkbReserve = Number(ethers.formatEther(reserve1));
      
      setReserves({ tka: tkaReserve.toFixed(2), tkb: tkbReserve.toFixed(2) });
      setTotalLpShares(ethers.formatEther(totalShares));
      
      const rate = tkaReserve > 0 ? tkbReserve / tkaReserve : 0;
      setExchangeRate(rate.toFixed(6));
    } catch (e) {
      console.error("Failed to update pool info:", e);
    }
  };

  const updateLpInfo = async () => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const shares = await pool.lpShares(account);
      const sharesNum = Number(ethers.formatEther(shares));
      setLpShares(sharesNum.toFixed(6));
      
      if (sharesNum > 0 && Number(totalLpShares) > 0) {
        const sharePercent = (sharesNum / Number(totalLpShares)) * 100;
        setPoolShare(sharePercent.toFixed(2));
      } else {
        setPoolShare('0');
      }
    } catch (e) {
      console.error("Failed to update LP info:", e);
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

  const handleRemoveLiquidity = async () => {
    if (!signer || !removeShares) return;
    if (parseFloat(removeShares) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (parseFloat(removeShares) > parseFloat(lpShares)) {
      alert(`You only have ${lpShares} LP shares`);
      return;
    }
    setLoading(true);
    try {
      const shares = ethers.parseEther(removeShares);
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
      const tx = await router.removeLiquidity(
        CONTRACT_ADDRESSES.TOKEN_A,
        CONTRACT_ADDRESSES.TOKEN_B,
        shares
      );
      await tx.wait();
      
      alert("✓ Liquidity removed successfully!");
      setRemoveShares('');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Remove liquidity failed:", error);
      alert("Remove liquidity failed: " + (error as Error).message);
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
  const estimatedValue = lpShares !== '0' && totalLpShares !== '0' ? (parseFloat(lpShares) / parseFloat(totalLpShares)) * tvl : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
      <div className="flex gap-2 mb-6 bg-black/30 rounded-xl p-1">
        <button onClick={() => setMode('add')} className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${mode === 'add' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          <Plus className="w-4 h-4" /> Add Liquidity
        </button>
        <button onClick={() => setMode('remove')} className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${mode === 'remove' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          <Minus className="w-4 h-4" /> Remove Liquidity
        </button>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-semibold">Your LP Position</span>
        </div>
        <div className="flex justify-between items-center">
          <div><p className="text-gray-400 text-xs">LP Shares</p><p className="text-white text-xl font-bold">{lpShares}</p></div>
          <div><p className="text-gray-400 text-xs">Pool Share</p><p className="text-green-400 text-xl font-bold">{poolShare}%</p></div>
          <div><p className="text-gray-400 text-xs">Est. Value</p><p className="text-white text-xl font-bold">${estimatedValue.toFixed(2)}</p></div>
        </div>
      </div>

      {mode === 'add' && (
        <>
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
        </>
      )}

      {mode === 'remove' && (
        <>
          <div className="bg-black/30 rounded-2xl p-4 mb-6">
            <div className="flex justify-between mb-2"><span className="text-gray-400 text-sm">LP Shares to Remove</span><span className="text-gray-400 text-sm">Balance: {lpShares}</span></div>
            <div className="flex items-center justify-between">
              <input type="number" value={removeShares} onChange={(e) => setRemoveShares(e.target.value)} placeholder="0.0" className="bg-transparent text-white text-3xl w-full outline-none" step="0.1" />
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl"><div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div><span className="text-white font-medium">LP</span></div>
            </div>
            {removeShares && lpShares !== '0' && (
              <div className="mt-3 text-xs text-gray-400">
                You will receive ≈ {(parseFloat(removeShares) / parseFloat(lpShares) * parseFloat(reserves.tka)).toFixed(4)} TKA and {(parseFloat(removeShares) / parseFloat(lpShares) * parseFloat(reserves.tkb)).toFixed(4)} TKB
              </div>
            )}
          </div>
          <button onClick={handleRemoveLiquidity} disabled={loading || !removeShares || parseFloat(removeShares) <= 0 || parseFloat(removeShares) > parseFloat(lpShares)} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Remove Liquidity'}
          </button>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-center mb-2"><span className="text-gray-400 text-sm">Pool Reserves</span><button onClick={() => loadData()} className="text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button></div>
        <div className="flex justify-between text-sm"><span className="text-gray-300">TKA: {reserves.tka}</span><span className="text-gray-300">TKB: {reserves.tkb}</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="text-gray-300">Total LP Shares</span><span className="text-gray-300">{totalLpShares}</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="text-gray-300">Exchange Rate</span><span className="text-green-400">1 TKA = {exchangeRate} TKB</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="text-gray-300">Fee</span><span className="text-gray-300">0.3%</span></div>
      </div>
    </div>
  );
}
