import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RELAYER_URL } from '../config/contracts';

declare global {
  interface Window {
    ethereum: any;
  }
}

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ROUTER_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256)",
  "function getPool(address tokenA, address tokenB) view returns (address)"
];

const FORWARDER_ABI = [
  "function nonces(address) view returns (uint256)"
];

export const SwapCard: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [tkaBalance, setTkaBalance] = useState<string>('0');
  const [tkbBalance, setTkbBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useGasless, setUseGasless] = useState<boolean>(false);

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
      }
    }
  };

  const checkGaslessEligibility = async (address: string, provider: ethers.BrowserProvider) => {
    const balance = await provider.getBalance(address);
    const ethBalanceNum = parseFloat(ethers.formatEther(balance));
    setEthBalance(ethBalanceNum.toFixed(4));
    // If user has less than 0.001 ETH, suggest gasless
    setUseGasless(ethBalanceNum < 0.001);
  };

  const updateBalances = async (address: string, provider: ethers.BrowserProvider) => {
    const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, provider);
    const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, ERC20_ABI, provider);
    
    const tkaBalance = await tokenA.balanceOf(address);
    const tkbBalance = await tokenB.balanceOf(address);
    const ethBal = await provider.getBalance(address);
    
    setTkaBalance(ethers.formatEther(tkaBalance));
    setTkbBalance(ethers.formatEther(tkbBalance));
    setEthBalance(ethers.formatEther(ethBal));
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
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleSwap = async () => {
    if (!signer || !amount) return;
    setLoading(true);
    
    try {
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, signer);
      const swapAmount = ethers.parseEther(amount);
      
      // Check allowance
      const allowance = await tokenA.allowance(account, CONTRACT_ADDRESSES.GASLESS_ROUTER);
      
      if (allowance < swapAmount) {
        console.log("Approving...");
        const approveTx = await tokenA.approve(CONTRACT_ADDRESSES.GASLESS_ROUTER, swapAmount);
        await approveTx.wait();
      }
      
      if (useGasless) {
        // Gasless transaction via relayer
        await handleGaslessSwap(swapAmount);
      } else {
        // Regular transaction
        const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
        const tx = await router.swap(
          CONTRACT_ADDRESSES.TOKEN_A,
          CONTRACT_ADDRESSES.TOKEN_B,
          swapAmount
        );
        await tx.wait();
      }
      
      await updateBalances(account, provider!);
      setAmount('');
      alert("Swap successful!");
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
    const userAddress = account;
    
    const router = new ethers.Contract(CONTRACT_ADDRESSES.GASLESS_ROUTER, ROUTER_ABI, signer!);
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
      from: userAddress,
      to: CONTRACT_ADDRESSES.GASLESS_ROUTER,
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

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Swap Tokens</h2>
      
      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p className="text-sm text-gray-600">TKA: {parseFloat(tkaBalance).toFixed(2)}</p>
            <p className="text-sm text-gray-600">TKB: {parseFloat(tkbBalance).toFixed(2)}</p>
            <p className="text-sm text-gray-600">ETH: {parseFloat(ethBalance).toFixed(4)}</p>
            {useGasless && (
              <p className="text-sm text-green-600 font-semibold mt-1">
                ⚡ Gas-free mode enabled (low ETH balance)
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (TKA)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="0.0"
              step="0.1"
            />
          </div>
          
          <button
            onClick={handleSwap}
            disabled={loading || !amount}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              loading || !amount
                ? 'bg-gray-400 cursor-not-allowed'
                : useGasless
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Swapping...' : useGasless ? '⚡ Swap (Gas-Free)' : 'Swap'}
          </button>
          
          {useGasless && (
            <p className="text-xs text-green-600 text-center mt-3">
              🔥 You have low ETH balance. Using gas-free transaction via relayer.
            </p>
          )}
        </>
      )}
    </div>
  );
};
