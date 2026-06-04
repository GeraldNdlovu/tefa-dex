interface TokenInputProps {
  label: string;
  token: 'TKA' | 'TKB';
  balance: number;
  amount: string;
  onAmountChange?: (val: string) => void;
  disabled?: boolean;
  onTokenToggle?: () => void;
  readOnly?: boolean;
}

export function TokenInput({
  label,
  token,
  balance,
  amount,
  onAmountChange,
  disabled,
  onTokenToggle,
  readOnly
}: TokenInputProps) {
  return (
    <div className="bg-black/30 rounded-2xl p-4">
      <div className="flex justify-between text-white/50 text-xs mb-1">
        <span>{label}</span>
        <span>Balance: {balance.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onTokenToggle}
          disabled={disabled}
          className="w-28 bg-white/10 rounded-xl px-0 py-2 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {token === 'TKA' ? '⚡ TKA' : '💎 TKB'}
          {!disabled && <span className="text-xs opacity-60">▼</span>}
        </button>
        <div className="flex-1 min-w-0 overflow-x-auto">
          <input
            type={readOnly ? 'text' : 'number'}
            value={amount}
            onChange={readOnly ? undefined : (e) => onAmountChange?.(e.target.value)}
            placeholder="0.0"
            readOnly={readOnly}
            className="w-full bg-transparent text-6xl font-bold text-right text-white outline-none placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
