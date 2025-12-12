import React, { useState, useMemo } from 'react';
import { NetWorthItem } from '../types';
import { TrendingUp, PieChart, BarChart3, Wallet } from 'lucide-react';
import NetWorthSnapshot from './NetWorthSnapshot';
import NetWorthForecast from './NetWorthForecast';
import InvestmentCapacity from './InvestmentCapacity';

const NetWorthCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'capacity' | 'dashboard'>('snapshot');
  
  // State lifted to Parent so we can pass Net Worth total to Forecast
  const [items, setItems] = useState<NetWorthItem[]>([
    { id: '1', name: 'Primary Home Value', value: 450000, type: 'asset' },
    { id: '2', name: 'Retirement (401k/IRA)', value: 120000, type: 'asset' },
    { id: '3', name: 'Cash/Savings', value: 25000, type: 'asset' },
    { id: '4', name: 'Mortgage', value: 380000, type: 'liability' },
    { id: '5', name: 'Car Loan', value: 15000, type: 'liability' },
  ]);

  // Track projected value from child component
  const [projectedYear15, setProjectedYear15] = useState(0);

  // State to hold the calculated capacity from the middle tab
  const [importedCapacity, setImportedCapacity] = useState<number | null>(null);

  const stats = useMemo(() => {
    const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, curr) => acc + curr.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    return { netWorth };
  }, [items]);

  const handleCapacityTransfer = (amount: number) => {
    setImportedCapacity(amount);
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
      {/* Header Area */}
      <div className="bg-slate-900 p-6">
        <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Family Wealth Control Panel
            </h2>
            <p className="text-slate-400 text-sm mt-1 ml-1">
             Clarity for real-life money decisions
            </p>
        </div>
        
        {/* Tabs - Evenly Spaced */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 bg-slate-800/50 p-2 rounded-xl">
            <button 
                onClick={() => setActiveTab('snapshot')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col md:flex-row items-center justify-center text-center gap-2 h-full ${activeTab === 'snapshot' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <PieChart className="w-5 h-5 shrink-0" />
                <span className="whitespace-normal leading-tight">1. Net Worth Snapshot</span>
            </button>
            <button 
                onClick={() => setActiveTab('capacity')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col md:flex-row items-center justify-center text-center gap-2 h-full ${activeTab === 'capacity' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <Wallet className="w-5 h-5 shrink-0" />
                <span className="whitespace-normal leading-tight">2. Investment Capacity</span>
            </button>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col md:flex-row items-center justify-center text-center gap-2 h-full ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span className="whitespace-normal leading-tight">3. Wealth Trajectory</span>
            </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-200">
         <div className="flex justify-between items-center max-w-4xl mx-auto">
             <div>
                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Net Worth (Time Zero)</div>
                 <div className={`text-3xl md:text-4xl font-serif font-bold ${stats.netWorth >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    ${stats.netWorth.toLocaleString()}
                 </div>
             </div>
             {activeTab === 'dashboard' && (
                 <div className="text-right">
                     <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Projected Year 15</div>
                     <div className="text-3xl md:text-4xl font-serif font-bold text-emerald-600">
                        ${projectedYear15.toLocaleString()}
                     </div>
                 </div>
             )}
             {activeTab === 'capacity' && (
                 <div className="text-right hidden md:block">
                     <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Goal</div>
                     <div className="text-sm text-slate-600 max-w-xs text-right">
                        Determine your "Safe Number" before you project your future.
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* Render all but hide to preserve state */}
      <NetWorthSnapshot 
        items={items} 
        setItems={setItems} 
        isHidden={activeTab !== 'snapshot'} 
      />

      <InvestmentCapacity 
        isHidden={activeTab !== 'capacity'}
        onApplyToForecast={handleCapacityTransfer}
      />
      
      <NetWorthForecast 
        startingNetWorth={stats.netWorth} 
        isHidden={activeTab !== 'dashboard'}
        onProjectionUpdate={setProjectedYear15}
        importedMonthlyContribution={importedCapacity}
      />

    </div>
  );
};

export default NetWorthCalculator;