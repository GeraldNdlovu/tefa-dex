interface FooterStatsProps {
  reserves: { TKA: number; TKB: number };
}

export function FooterStats({ reserves }: FooterStatsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-6 pt-4 border-t border-white/20">
        <div>
          <div className="text-white/40">TKA RESERVE</div>
          <div className="text-white font-mono">{reserves.TKA}</div>
        </div>
        <div>
          <div className="text-white/40">TKB RESERVE</div>
          <div className="text-white font-mono">{reserves.TKB}</div>
        </div>
        <div>
          <div className="text-white/40">FEE</div>
          <div className="text-white">0.3%</div>
        </div>
      </div>
      <div className="text-white/30 text-center text-xs mt-3">
        Gasless • EIP-2771 • Sepolia
      </div>
    </>
  );
}
