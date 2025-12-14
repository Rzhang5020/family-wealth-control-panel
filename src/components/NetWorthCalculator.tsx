import React, { useState, useMemo } from 'react';
import type { NetWorthItem, ForecastSettings, ActualRecord } from '../types';
import { TrendingUp, PieChart, BarChart3, Wallet, Activity } from 'lucide-react';
import NetWorthSnapshot from './NetWorthSnapshot';
import NetWorthForecast from './NetWorthForecast';
import InvestmentCapacity from './InvestmentCapacity';
import ActualOutlook from './ActualOutlook';

const NetWorthCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'capacity' | 'dashboard' | 'outlook'>('snapshot');
  
  // State lifted to Parent so we can pass Net Worth total to Forecast
  const [items, setItems] = useState<NetWorthItem[]>([
    { id: '1', name: 'Primary Home Value', value: 450000, type: 'asset' },
    { id: '2', name: 'Retirement (401k/IRA)', value: 120000, type: 'asset' },
    { id: '3', name: 'Cash/Savings', value: 25000, type: 'asset' },
    { id: '4', name: 'Mortgage', value: 380000, type: 'liability' },
    { id: '5', name: 'Car Loan', value: 15000, type: 'liability' },
  ]);

  // Forecast Settings (Shared between Tab 3 and Tab 4)
  const [forecastSettings, setForecastSettings] = useState<ForecastSettings>({
    startYear: 2026,
    phase1Monthly: 3000,
    phase2Monthly: 1500,
    phase3Monthly: 4000,
    annualReturn: 8,
    customStages: {},
    customReturns: {}
  });

  // Actuals Data (For Tab 4)
  const [actuals, setActuals] = useState<ActualRecord[]>([]);

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
    // Update the Phase 1 setting automatically if coming from Capacity tab
    setForecastSettings(prev => ({ ...prev, phase1Monthly: amount }));
    setActiveTab('dashboard');
  };

  const handleUpdateActual = (newRecord: ActualRecord) => {
    setActuals(prev => {
        const others = prev.filter(p => p.yearIndex !== newRecord.yearIndex);
        return [...others, newRecord];
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col print:shadow-none print:border-none print:overflow-visible print:h-auto">
      <style>{`
        @media print {
          @page { margin: 0.5in; size: landscape; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break-after { page-break-after: always; }
          /* Ensure all charts and inputs print clearly */
          input { border: none !important; padding: 0 !important; }
        }

        /* 
           ROBUST VISIBILITY STRATEGY: 
           We hide non-active tabs ONLY on screen. 
           This means when printing, the browser ignores 'screen-hidden', 
           so ALL tabs are visible to the printer.
        */
        @media screen {
          .screen-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Area - Hidden in Print */}
      <div className="bg-slate-900 p-6 no-print">
        <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Family Wealth Control Panel™
            </h2>
            <p className="text-slate-400 text-sm mt-1 ml-1">
             Clarity for real-life money decisions
            </p>
        </div>
        
        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 bg-slate-800/50 p-2 rounded-xl">
            <button 
                onClick={() => setActiveTab('snapshot')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'snapshot' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <PieChart className="w-4 h-4 shrink-0" />
                <span className="leading-tight">1. Net Worth Snapshot</span>
            </button>
            <button 
                onClick={() => setActiveTab('capacity')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'capacity' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="leading-tight">2. Investment Capacity</span>
            </button>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="leading-tight">3. Wealth Trajectory</span>
            </button>
            <button 
                onClick={() => setActiveTab('outlook')}
                className={`px-2 py-3 rounded-lg text-sm font-medium transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'outlook' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <Activity className="w-4 h-4 shrink-0" />
                <span className="leading-tight">4. Actuals & Outlook</span>
            </button>
        </div>
      </div>

      {/* Printable Title for PDF */}
      <div className="hidden print:block p-6 text-center border-b-2 border-slate-900 mb-4">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Family Wealth Control Panel™ Report</h1>
        <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-200 print:bg-white print:border-none print:p-0 print:mb-6">
         <div className="flex justify-between items-center max-w-4xl mx-auto print:max-w-none">
             <div>
                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Net Worth (Time Zero)</div>
                 <div className={`text-3xl md:text-4xl font-serif font-bold ${stats.netWorth >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    ${stats.netWorth.toLocaleString()}
                 </div>
             </div>
             {(activeTab === 'dashboard' || activeTab === 'outlook') && (
                 <div className="text-right print:block">
                     <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Projected Year 15</div>
                     <div className="text-3xl md:text-4xl font-serif font-bold text-emerald-600">
                        ${projectedYear15.toLocaleString()}
                     </div>
                 </div>
             )}
         </div>
      </div>

      {/* 
         COMPONENT RENDERING:
         All components are rendered. 
         Active one uses empty string class (visible).
         Inactive ones use 'screen-hidden' (hidden on screen, visible in print).
      */}
      
      <div className={`w-full ${activeTab === 'snapshot' ? '' : 'screen-hidden'} print:break-after`}>
        <div className="hidden print:block font-bold text-xl text-slate-900 mb-4 px-6 pt-4 border-b border-slate-200">1. Net Worth Snapshot</div>
        <NetWorthSnapshot 
            items={items} 
            setItems={setItems} 
            isHidden={false} 
        />
      </div>

      <div className={`w-full ${activeTab === 'capacity' ? '' : 'screen-hidden'} print:break-after`}>
        <div className="hidden print:block font-bold text-xl text-slate-900 mb-4 px-6 pt-4 border-b border-slate-200">2. Investment Capacity</div>
        <InvestmentCapacity 
            isHidden={false}
            onApplyToForecast={handleCapacityTransfer}
        />
      </div>
      
      <div className={`w-full ${activeTab === 'dashboard' ? '' : 'screen-hidden'} print:break-after`}>
        <div className="hidden print:block font-bold text-xl text-slate-900 mb-4 px-6 pt-4 border-b border-slate-200">3. Wealth Trajectory</div>
        <NetWorthForecast 
            startingNetWorth={stats.netWorth} 
            isHidden={false}
            onProjectionUpdate={setProjectedYear15}
            settings={forecastSettings}
            onSettingsChange={setForecastSettings}
        />
      </div>

      <div className={`w-full ${activeTab === 'outlook' ? '' : 'screen-hidden'}`}>
        <div className="hidden print:block font-bold text-xl text-slate-900 mb-4 px-6 pt-4 border-b border-slate-200">4. Actuals & Outlook</div>
        <ActualOutlook 
            startingNetWorth={stats.netWorth}
            settings={forecastSettings}
            actuals={actuals}
            onUpdateActual={handleUpdateActual}
            isHidden={false}
        />
      </div>

    </div>
  );
};

export default NetWorthCalculator;