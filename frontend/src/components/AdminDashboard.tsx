import { usePermissions } from '../contexts/AuthContext';
import { Shield, Lock, LogIn, AlertCircle, Wallet, Activity, TrendingUp, Settings, Users, DollarSign } from 'lucide-react';
import { AdminPanel } from './AdminPanel';

export function AdminDashboard({ account, provider }: any) {
  const { isAuthenticated, isLoading, login, permissions } = usePermissions();

  if (!account) {
    return (
      <div className="glass-card p-8 text-center">
        <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">Connect Wallet</h3>
        <p className="text-gray-400 text-sm">Connect your wallet to access admin features</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-3">Loading permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-8 text-center">
        <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">Admin Access Required</h3>
        <p className="text-gray-400 text-sm mb-4">Sign in with your admin wallet to access the dashboard</p>
        <button
          onClick={login}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 mx-auto hover:from-purple-600 hover:to-purple-700 transition"
        >
          <LogIn className="w-4 h-4" />
          Sign to Login
        </button>
        <p className="text-xs text-gray-500 mt-4">Wallet: {account.slice(0, 8)}...{account.slice(-6)}</p>
      </div>
    );
  }

  // Full admin dashboard
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          <h2 className="text-white font-semibold">Admin Dashboard</h2>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Authenticated</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Wallet</p>
            <p className="text-white font-mono text-sm break-all">{account}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Permissions</p>
            <p className="text-white text-sm">{permissions.length} granted</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Role</p>
            <p className="text-green-400 text-sm">Super Admin</p>
          </div>
        </div>
      </div>
      
      <AdminPanel account={account} provider={provider} />
    </div>
  );
}
