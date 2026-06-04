import { ArrowDownUp } from 'lucide-react';

export function SwapArrow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center -my-2">
      <button
        onClick={onClick}
        className="bg-white/10 backdrop-blur rounded-full p-2 border border-white/20 hover:bg-white/20 transition-all"
      >
        <ArrowDownUp className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
