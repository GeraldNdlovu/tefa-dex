import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { ethers } from 'ethers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const POOL_ABI = [
  "function getReserves() view returns (uint256, uint256)"
];

interface PriceChartProps {
  provider: any;
}

export function PriceChart({ provider }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    if (provider) {
      fetchPriceHistory();
      const interval = setInterval(fetchPriceHistory, 30000);
      return () => clearInterval(interval);
    }
  }, [provider]);

  const fetchPriceHistory = async () => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.POOL, POOL_ABI, provider);
      const [reserve0, reserve1] = await pool.getReserves();
      const rate = Number(ethers.formatEther(reserve1)) / Number(ethers.formatEther(reserve0));
      
      setPriceHistory(prev => {
        const newHistory = [...prev.slice(-29), rate];
        return newHistory;
      });
      setLastPrice(rate);
      
      if (priceHistory.length > 0) {
        const change = ((rate - priceHistory[0]) / priceHistory[0]) * 100;
        setPriceChange(change);
      }
    } catch (e) {
      console.error("Failed to fetch price:", e);
    }
  };

  const chartData = {
    labels: priceHistory.map((_, i) => `${i * 2}m ago`),
    datasets: [
      {
        label: 'TKA/TKB',
        data: priceHistory,
        borderColor: '#c084fc',
        backgroundColor: 'rgba(192, 132, 252, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }
    }
  };

  if (priceHistory.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Loading price data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold">Real-time Price Chart</h3>
        </div>
        <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </div>
      </div>
      <div className="h-48">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="mt-3 text-center">
        <span className="text-2xl font-bold text-white">{lastPrice.toFixed(6)}</span>
        <span className="text-gray-400 text-sm ml-2">TKA/TKB</span>
      </div>
      <div className="mt-2 text-center text-xs text-gray-500">
        Live from pool reserves
      </div>
    </div>
  );
}
