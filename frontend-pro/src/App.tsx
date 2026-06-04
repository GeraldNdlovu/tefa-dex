import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { ArrowDownUp, Wallet, RefreshCw } from 'lucide-react';

declare global { interface Window { ethereum: any; } }

const RPC_URL = import.meta.env.VITE_RPC_URL;
const CONTRACTS = {
  ROUTER: import.meta.env.VITE_ROUTER,
  TKA: import.meta.env.VITE_TKA,
  TKB: import.meta.env.VITE_TKB,
  POOL: import.meta.env.VITE_POOL,
};

const FEE = 3;
const FEE_DENOM = 1000;

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ROUTER_ABI = [
  "function swap(address,address,uint256,uint256,uint256) returns (uint256)"
];

const POOL_ABI = [
  "function getReserves() view returns (uint112,uint112,uint32)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

function formatToken(amount: ethers.BigNumber, decimals: number): string {
  return ethers.utils.formatUnits(amount, decimals);
}

function App() {
  const [account, setAccount] = useState('');
  const [fromToken, setFromToken] = useState<'TKA'|'TKB'>('TKB');
  const [toToken, setToToken] = useState<'TKA'|'TKB'>('TKA');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [balances, setBalances] = useState({ TKA: ethers.BigNumber.from(0), TKB: ethers.BigNumber.from(0) });
  const [reserves, setReserves] = useState({ TKA: ethers.BigNumber.from(0), TKB: ethers.BigNumber.from(0) });
  const [decimals, setDecimals] = useState({ TKA: 18, TKB: 18 });
  const [needsApproval, setNeedsApproval] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [slippage] = useState(0.5);

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  // Fetch token decimals
  useEffect(() => {
    const fetchDecimals = async () => {
      const tka = new ethers.Contract(CONTRACTS.TKA, ERC20_ABI, provider);
      const tkb = new ethers.Contract(CONTRACTS.TKB, ERC20_ABI, provider);
      const [d1, d2] = await Promise.all([tka.decimals(), tkb.decimals()]);
      setDecimals({ TKA: d1, TKB: d2 });
    };
    fetchDecimals();
  }, [provider]);

  // Fetch reserves with correct mapping
  const fetchReserves = useCallback(async () => {
    try {
      const pool = new ethers.Contract(CONTRACTS.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      const token0 = await pool.token0();
      const isTKA0 = token0.toLowerCase() === CONTRACTS.TKA.toLowerCase();
      setReserves({
        TKA: isTKA0 ? reserve0 : reserve1,
        TKB: isTKA0 ? reserve1 : reserve0
      });
    } catch (err) {
      console.error("Reserves error:", err);
    }
  }, [provider]);

  // Fetch user balances
  const fetchBalances = useCallback(async (addr: string) => {
    const tka = new ethers.Contract(CONTRACTS.TKA, ERC20_ABI, provider);
    const tkb = new ethers.Contract(CONTRACTS.TKB, ERC20_ABI, provider);
    const [balTKA, balTKB] = await Promise.all([tka.balanceOf(addr), tkb.balanceOf(addr)]);
    setBalances({ TKA: balTKA, TKB: balTKB });
  }, [provider]);

  // Check allowance
  const checkAllowance = useCallback(async (addr: string) => {
    if (!amount || parseFloat(amount) === 0) return;
    const tokenAddr = fromToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB;
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
    const allowance = await token.allowance(addr, CONTRACTS.ROUTER);
    const required = ethers.utils.parseUnits(amount, decimals[fromToken]);
    setNeedsApproval(allowance.lt(required));
  }, [amount, fromToken, decimals, provider]);

  // Approve
  const handleApprove = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const signer = provider.getSigner(account);
      const tokenAddr = fromToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB;
      const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
      const amountWei = ethers.utils.parseUnits(amount, decimals[fromToken]);
      const tx = await token.approve(CONTRACTS.ROUTER, amountWei);
      setTxStatus("Approving...");
      await tx.wait();
      setTxStatus("Approved");
      setNeedsApproval(false);
      setTimeout(() => setTxStatus(''), 3000);
    } catch (err: any) {
      setTxStatus(`Approval failed: ${err.message.slice(0, 60)}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate output
  const getOutput = useCallback((amountIn: ethers.BigNumber): ethers.BigNumber => {
    const reserveIn = fromToken === 'TKA' ? reserves.TKA : reserves.TKB;
    const reserveOut = fromToken === 'TKA' ? reserves.TKB : reserves.TKA;
    if (reserveIn.isZero() || reserveOut.isZero()) return ethers.BigNumber.from(0);
    const amountInWithFee = amountIn.mul(FEE_DENOM - FEE);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(FEE_DENOM).add(amountInWithFee);
    return numerator.div(denominator);
  }, [fromToken, reserves]);

  // Swap
  const handleSwap = async () => {
    if (!account || !amount) return;
    setLoading(true);
    setTxStatus("Swapping...");
    try {
      const router = new ethers.Contract(CONTRACTS.ROUTER, ROUTER_ABI, provider.getSigner(account));
      const amountIn = ethers.utils.parseUnits(amount, decimals[fromToken]);
      const expectedOut = getOutput(amountIn);
      const slippageBps = Math.round(slippage * 100);
      const minOut = expectedOut.mul(10000 - slippageBps).div(10000);
      const tx = await router.swap(
        fromToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB,
        toToken === 'TKA' ? CONTRACTS.TKA : CONTRACTS.TKB,
        amountIn,
        minOut,
        Math.floor(Date.now() / 1000) + 1200
      );
      setTxStatus(`Submitted: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      setTxStatus("Swap complete!");
      await fetchBalances(account);
      await fetchReserves();
      setAmount('');
      setTimeout(() => setTxStatus(''), 4000);
    } catch (err: any) {
      setTxStatus(`Swap failed: ${err.message.slice(0, 60)}`);
    } finally {
      setLoading(false);
    }
  };

  const rate = useMemo(() => {
    if (reserves.TKA.isZero() || reserves.TKB.isZero()) return "0";
    const r = fromToken === 'TKA'
      ? reserves.TKB.mul(ethers.utils.parseEther("1")).div(reserves.TKA)
      : reserves.TKA.mul(ethers.utils.parseEther("1")).div(reserves.TKB);
    return parseFloat(ethers.utils.formatEther(r)).toFixed(6);
  }, [fromToken, reserves]);

  const expectedOut = useMemo(() => {
    if (!amount || parseFloat(amount) === 0) return "0";
    const amt = ethers.utils.parseUnits(amount, decimals[fromToken]);
    const out = getOutput(amt);
    return parseFloat(formatToken(out, decimals[toToken])).toFixed(6);
  }, [amount, fromToken, decimals, getOutput, toToken]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // Load data
  useEffect(() => {
    if (account) {
      fetchBalances(account);
      checkAllowance(account);
    }
    fetchReserves();
  }, [account, fetchBalances, fetchReserves, checkAllowance]);

  const refresh = async () => {
    setRefreshing(true);
    if (account) await fetchBalances(account);
    await fetchReserves();
    if (account && amount) await checkAllowance(account);
    setRefreshing(false);
  };

  const setMax = () => {
    const maxBal = fromToken === 'TKA' ? balances.TKA : balances.TKB;
    setAmount(formatToken(maxBal, decimals[fromToken]));
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 shadow-2xl border border-white/20">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">TEFA DEX</h1>
            <div className="flex gap-2">
              <button onClick={refresh} disabled={refreshing} className="p-2 rounded-xl hover:bg-white/10">
                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={connectWallet} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-white font-medium hover:bg-blue-700">
                <Wallet className="w-4 h-4" />
                {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect'}
              </button>
            </div>
          </div>

          {/* From card */}
          <div className="bg-black/30 rounded-xl p-4 mb-2">
            <div className="flex justify-between text-white/60 text-sm mb-2">
              <span>From</span>
              <button onClick={setMax} className="text-blue-400 text-xs">MAX</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setFromToken(fromToken === 'TKA' ? 'TKB' : 'TKA')}
                      className="bg-white/10 px-4 py-2 rounded-xl text-white font-medium whitespace-nowrap">
                {fromToken === 'TKA' ? '⚡ TKA' : '💎 TKB'}
              </button>
              <div className="flex-1 min-w-0">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                       placeholder="0.0"
                       className="w-full bg-transparent text-3xl text-right text-white outline-none placeholder-white/30" />
              </div>
            </div>
            <div className="text-white/40 text-xs text-right mt-1">
              Balance: {formatToken(fromToken === 'TKA' ? balances.TKA : balances.TKB, decimals[fromToken])}
            </div>
          </div>

          {/* Swap arrow */}
          <div className="flex justify-center -my-2">
            <button onClick={switchTokens} className="bg-white/10 rounded-full p-2 backdrop-blur border border-white/20">
              <ArrowDownUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To card */}
          <div className="bg-black/30 rounded-xl p-4 mt-2">
            <div className="text-white/60 text-sm mb-2">To (estimated)</div>
            <div className="flex items-center gap-3">
              <button disabled className="bg-white/10 px-4 py-2 rounded-xl text-white/70 font-medium whitespace-nowrap">
                {toToken === 'TKA' ? '⚡ TKA' : '💎 TKB'}
              </button>
              <div className="flex-1 min-w-0">
                <input type="text" value={expectedOut} disabled
                       className="w-full bg-transparent text-3xl text-right text-white/70 outline-none" />
              </div>
            </div>
          </div>

          {/* Rate */}
          <div className="text-white/50 text-sm text-center mt-3">
            1 {fromToken} = {rate} {toToken}
          </div>

          {/* Action button */}
          {needsApproval && amount && parseFloat(amount) > 0 ? (
            <button onClick={handleApprove} disabled={loading}
                    className="w-full mt-4 bg-yellow-600 py-3 rounded-xl text-white font-bold">
              {loading ? 'Approving...' : `Approve ${fromToken}`}
            </button>
          ) : (
            <button onClick={handleSwap} disabled={loading || !amount || !account}
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 py-3 rounded-xl text-white font-bold disabled:opacity-50">
              {!account ? 'Connect Wallet' : loading ? 'Processing...' : `Swap ${fromToken} → ${toToken}`}
            </button>
          )}

          {txStatus && (
            <div className="mt-3 text-center text-sm text-white/80 bg-white/10 p-2 rounded-xl">
              {txStatus}
            </div>
          )}

          {/* Reserve stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-5 pt-3 border-t border-white/20">
            <div><div className="text-white/40">TKA Reserve</div><div className="text-white font-mono">{formatToken(reserves.TKA, decimals.TKA)}</div></div>
            <div><div className="text-white/40">TKB Reserve</div><div className="text-white font-mono">{formatToken(reserves.TKB, decimals.TKB)}</div></div>
            <div><div className="text-white/40">Fee</div><div className="text-white">0.3%</div></div>
          </div>
          <div className="text-white/30 text-center text-xs mt-3">Gasless • EIP-2771 • Sepolia</div>
        </div>
      </div>
    </div>
  );
}

export default App;
