import React, { useState, useMemo, useEffect } from 'react';
import type { NetWorthItem, ForecastSettings, ActualRecord } from '../types';
import { TrendingUp, PieChart, BarChart3, Wallet, Activity, Trash2 } from 'lucide-react';
import NetWorthSnapshot from './NetWorthSnapshot';
import NetWorthForecast from './NetWorthForecast';
import InvestmentCapacity from './InvestmentCapacity';
import ActualOutlook from './ActualOutlook';

const NetWorthCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'capacity' | 'dashboard' | 'outlook'>('snapshot');
  
  // --- INITIAL DATA (DEFAULTS) ---
  const defaultItems: NetWorthItem[] = [
    { id: '1', name: 'Primary Home Value', value: 450000, type: 'asset' },
    { id: '2', name: 'Retirement (401k/IRA)', value: 120000, type: 'asset' },
    { id: '3', name: 'Cash/Savings', value: 25000, type: 'asset' },
    { id: '4', name: 'Mortgage', value: 380000, type: 'liability' },
    { id: '5', name: 'Car Loan', value: 15000, type: 'liability' },
  ];

  const defaultSettings: ForecastSettings = {
    startYear: 2026,
    phase1Monthly: 3000,
    phase2Monthly: 1500,
    phase3Monthly: 4000,
    annualReturn: 8,
    customStages: {},
    customReturns: {}
  };

  // --- PERSISTENT STATE INITIALIZATION ---

  const [items, setItems] = useState<NetWorthItem[]>(() => {
    try {
      const saved = localStorage.getItem('fwcp_snapshot_items');
      return saved ? JSON.parse(saved) : defaultItems;
    } catch (e) {
      return defaultItems;
    }
  });

  const [forecastSettings, setForecastSettings] = useState<ForecastSettings>(() => {
    try {
      const saved = localStorage.getItem('fwcp_forecast_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  const [actuals, setActuals] = useState<ActualRecord[]>(() => {
    try {
      const saved = localStorage.getItem('fwcp_actuals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [importedCapacity, setImportedCapacity] = useState<number | null>(() => {
     try {
       const saved = localStorage.getItem('fwcp_imported_capacity');
       return saved ? JSON.parse(saved) : null;
     } catch(e) {
       return null;
     }
  });

  // --- AUTO-SAVE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('fwcp_snapshot_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('fwcp_forecast_settings', JSON.stringify(forecastSettings));
  }, [forecastSettings]);

  useEffect(() => {
    localStorage.setItem('fwcp_actuals', JSON.stringify(actuals));
  }, [actuals]);

  useEffect(() => {
     if (importedCapacity !== null) {
        localStorage.setItem('fwcp_imported_capacity', JSON.stringify(importedCapacity));
     }
  }, [importedCapacity]);

  // --- RESET HANDLER ---
  const handleResetData = () => {
    if (window.confirm('⚠️ Are you sure you want to RESET everything?')) {
        localStorage.removeItem('fwcp_snapshot_items');
        localStorage.removeItem('fwcp_forecast_settings');
        localStorage.removeItem('fwcp_actuals');
        localStorage.removeItem('fwcp_imported_capacity');
        localStorage.removeItem('fwcp_cap_income');
        localStorage.removeItem('fwcp_cap_fixed');
        localStorage.removeItem('fwcp_cap_variable');
        localStorage.removeItem('fwcp_cap_hell');
        localStorage.removeItem('fwcp_cap_stretch');
        localStorage.removeItem('fwcp_forecast_overrides');
        window.location.reload();
    }
  };

  const [projectedYear15, setProjectedYear15] = useState(0);

  const stats = useMemo(() => {
    const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, curr) => acc + curr.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    return { netWorth };
  }, [items]);

  const handleCapacityTransfer = (amount: number) => {
    setImportedCapacity(amount);
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
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col print:shadow-none print:border-none print:overflow-visible print:h-auto">
      <style>{`
        @media print {
          @page { margin: 0.5in; size: landscape; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break-after { page-break-after: always; }
          input { border: none !important; padding: 0 !important; }
        }
        @media screen {
          .screen-hidden { display: none !important; }
        }
      `}</style>

      {/* Header Area */}
      <div className="bg-playbookBlue p-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <TrendingUp className="w-7 h-7 text-playbookGold" />
                Family Wealth Control Panel™
                </h2>
                <p className="text-slate-300 text-sm mt-1 ml-1">
                 Institutional-grade financial clarity
                </p>
            </div>
            
            <button 
                onClick={handleResetData}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-playbookBlue border border-playbookGold hover:bg-playbookGold hover:text-playbookBlue transition-all"
                title="Delete all data and start over"
            >
                <Trash2 className="w-4 h-4 text-playbookGold group-hover:text-playbookBlue" /> 
                <span className="text-xs font-bold text-playbookGold group-hover:text-playbookBlue">RESET DATA</span>
            </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 bg-black/20 p-2 rounded-xl">
            <button 
                onClick={() => setActiveTab('snapshot')}
                className={`px-2 py-3 rounded-lg text-sm font-bold transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'snapshot' ? 'bg-playbookGold text-playbookBlue shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
                <PieChart className="w-4 h-4 shrink-0" />
                <span className="leading-tight">1. Net Worth Snapshot</span>
            </button>
            <button 
                onClick={() => setActiveTab('capacity')}
                className={`px-2 py-3 rounded-lg text-sm font-bold transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'capacity' ? 'bg-playbookGold text-playbookBlue shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="leading-tight">2. Investment Capacity</span>
            </button>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-2 py-3 rounded-lg text-sm font-bold transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'dashboard' ? 'bg-playbookGold text-playbookBlue shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="leading-tight">3. Wealth Trajectory</span>
            </button>
            <button 
                onClick={() => setActiveTab('outlook')}
                className={`px-2 py-3 rounded-lg text-sm font-bold transition flex flex-col items-center justify-center text-center gap-1 h-full ${activeTab === 'outlook' ? 'bg-playbookGold text-playbookBlue shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
                <Activity className="w-4 h-4 shrink-0" />
                <span className="leading-tight">4. Actuals & Outlook</span>
            </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-6 bg-slate-50 border-b border-slate-200 print:bg-white print:border-none print:p-0 print:mb-6">
         <div className="flex justify-between items-center max-w-4xl mx-auto print:max-w-none">
             <div>
                 <div className="text-xs text-playbookBlue uppercase font-bold tracking-wider opacity-60">Current Net Worth (Time Zero)</div>
                 <div className={`text-3xl md:text-4xl font-serif font-bold ${stats.netWorth >= 0 ? 'text-playbookBlue' : 'text-rose-600'}`}>
                    ${stats.netWorth.toLocaleString()}
                 </div>
             </div>
             {(activeTab === 'dashboard' || activeTab === 'outlook') && (
                 <div className="text-right print:block">
                     <div className="text-xs text-playbookBlue uppercase font-bold tracking-wider opacity-60">Projected Year 15</div>
                     <div className="text-3xl md:text-4xl font-serif font-bold text-playbookGold">
                        ${projectedYear15.toLocaleString()}
                     </div>
                 </div>
             )}
         </div>
      </div>

      <div className={`w-full ${activeTab === 'snapshot' ? '' : 'screen-hidden'} print:break-after`}>
        <NetWorthSnapshot 
          items={items} 
          setItems={setItems} 
          isHidden={false} 
          onNext={() => setActiveTab('capacity')}
        />
      </div>

      <div className={`w-full ${activeTab === 'capacity' ? '' : 'screen-hidden'} print:break-after`}>
        <InvestmentCapacity isHidden={false} onApplyToForecast={handleCapacityTransfer} />
      </div>
      
      <div className={`w-full ${activeTab === 'dashboard' ? '' : 'screen-hidden'} print:break-after`}>
        <NetWorthForecast 
          startingNetWorth={stats.netWorth} 
          isHidden={false} 
          onProjectionUpdate={setProjectedYear15} 
          settings={forecastSettings} 
          onSettingsChange={setForecastSettings} 
          onNext={() => setActiveTab('outlook')}
        />
      </div>

      <div className={`w-full ${activeTab === 'outlook' ? '' : 'screen-hidden'}`}>
        <ActualOutlook startingNetWorth={stats.netWorth} settings={forecastSettings} actuals={actuals} onUpdateActual={handleUpdateActual} isHidden={false} />
      </div>
    </div>
  );
};

export default NetWorthCalculator;