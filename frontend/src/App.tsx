import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SwapCard } from './components/SwapCard';
import { Liquidity } from './components/Liquidity';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { Shield, Wallet, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'admin'>('swap');

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setProvider(web3Provider);
      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setAccount(accounts[0]);
          setProvider(web3Provider);
        }
      }
    };
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          window.location.reload();
        } else {
          setAccount(null);
          setProvider(null);
        }
      });
    }
  }, []);

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-white font-bold text-xl">TEFADEX</span>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">Gasless • Multi-Chain</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="glass-card p-8 text-center">
              <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to start gasless trading</p>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50"
              >
                {isConnecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    );
  }

  return (
    <AuthProvider account={account} provider={provider}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-white font-bold text-xl">TEFADEX</span>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">Gasless • Multi-Chain</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'swap'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Swap
              </button>
              <button
                onClick={() => setActiveTab('liquidity')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'liquidity'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Liquidity
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg px-3 py-1">
              <span className="text-xs text-gray-400">Wallet:</span>
              <span className="text-sm text-white ml-2">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          </div>
          
          {activeTab === 'swap' && <SwapCard account={account} provider={provider} />}
          {activeTab === 'liquidity' && <Liquidity account={account} provider={provider} />}
          {activeTab === 'admin' && <AdminDashboard account={account} provider={provider} />}
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </AuthProvider>
  );
}

export default App;
