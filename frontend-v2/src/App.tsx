import { SwapCard } from './components/SwapCard';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Header />
        <SwapCard />
      </div>
    </div>
  );
}

export default App;
