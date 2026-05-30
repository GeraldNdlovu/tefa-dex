import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

type Permission = string;

interface AuthContextType {
  address: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert address to checksum format
function toChecksumAddress(address: string): string {
  return ethers.getAddress(address);
}

export function AuthProvider({ children, account, provider }: { children: ReactNode; account: string | null; provider: any }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (): Promise<boolean> => {
    if (!provider || !account) return false;
    
    try {
      // Send CHECKSUMMED address (EIP-55 format)
      const checksumAddress = toChecksumAddress(account);
      console.log('Using checksum address:', checksumAddress);
      
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: checksumAddress })
      });
      
      const nonceData = await nonceRes.json();
      if (!nonceData.message) return false;
      
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonceData.message);
      
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          wallet: checksumAddress, 
          signature, 
          message: nonceData.message 
        })
      });
      
      if (loginRes.ok) {
        const data = await loginRes.json();
        setPermissions(data.permissions || ['admin.access']);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setPermissions([]);
  };

  const can = (permission: Permission) => permissions.includes(permission);
  const isAuthenticated = permissions.includes('admin.access');

  return (
    <AuthContext.Provider value={{ address: account, permissions, isAuthenticated, isLoading, can, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('usePermissions must be used within AuthProvider');
  return context;
}
