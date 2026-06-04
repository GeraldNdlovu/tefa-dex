import { Wallet } from 'lucide-react';

export function Header() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">TEFA DEX</h1>
      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all rounded-xl px-4 py-2 text-white text-sm font-medium">
        <Wallet className="w-4 h-4" />
        Connect
      </button>
    </div>
  );
}
