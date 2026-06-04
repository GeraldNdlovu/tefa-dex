import { useState } from 'react';
import { TokenInput } from './TokenInput';
import { SwapArrow } from './SwapArrow';
import { FooterStats } from './FooterStats';

const MOCK_BALANCES = { TKA: 983666.84, TKB: 989471.79 };
const MOCK_RESERVES = { TKA: 881, TKB: 1135 };
const MOCK_RATE = 0.776531;

export function SwapCard() {
  const [fromToken, setFromToken] = useState<'TKA' | 'TKB'>('TKB');
  const [toToken, setToToken] = useState<'TKA' | 'TKB'>('TKA');
  const [amount, setAmount] = useState('');

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  const getOutput = (input: string): string => {
    const val = parseFloat(input);
    if (isNaN(val)) return '0';
    if (fromToken === 'TKB' && toToken === 'TKA') return (val * MOCK_RATE).toFixed(6);
    if (fromToken === 'TKA' && toToken === 'TKB') return (val / MOCK_RATE).toFixed(6);
    return '0';
  };

  const output = amount ? getOutput(amount) : '0';

  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-5">
      <TokenInput
        label="From"
        token={fromToken}
        balance={MOCK_BALANCES[fromToken]}
        amount={amount}
        onAmountChange={setAmount}
        onTokenToggle={() => setFromToken(fromToken === 'TKA' ? 'TKB' : 'TKA')}
      />
      <SwapArrow onClick={handleSwitch} />
      <TokenInput
        label="To (estimated)"
        token={toToken}
        balance={MOCK_BALANCES[toToken]}
        amount={output}
        disabled
        readOnly
      />
      <div className="text-center text-white/60 text-sm mt-4">
        1 {fromToken} = {MOCK_RATE.toFixed(6)} {toToken}
      </div>
      <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all py-4 rounded-xl text-white font-bold text-lg shadow-lg">
        Connect Wallet
      </button>
      <FooterStats reserves={MOCK_RESERVES} />
    </div>
  );
}
