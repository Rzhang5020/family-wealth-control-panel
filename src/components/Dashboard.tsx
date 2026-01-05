import React, { useMemo } from 'react';
import type { FinancialItem, AppSettings, ProjectionData } from '../types';
import { SummaryCard } from './SummaryCard';
import { FinancialList } from './FinancialList';
import { AIAdvisor } from './AIAdvisor';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Wallet, CreditCard, TrendingUp, Plus, Settings, RefreshCw } from 'lucide-react';

// Local SettingsPanel component updated for color scheme
interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onReset: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onReset }) => {
  return (
    <div className="bg-[#D4AF37] text-[#001F3F] rounded-xl p-6 shadow-lg border border-[#001F3F]/10">
      <div className="flex items-center gap-2 mb-6 border-b border-[#001F3F]/20 pb-4">
        <Settings className="w-5 h-5 text-[#001F3F]" />
        <h3 className="font-bold text-lg">Control Panel</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#001F3F]/80">Projection Period</label>
            <span className="text-sm font-bold text-[#001F3F]">{settings.projectionYears} Years</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={settings.projectionYears}
            onChange={(e) => onUpdate({ ...settings, projectionYears: parseInt(e.target.value) })}
            className="w-full h-2 bg-[#001F3F]/20 rounded-lg appearance-none cursor-pointer accent-[#001F3F]"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#001F3F]/80">Inflation Adjustment</label>
            <span className="text-sm font-bold text-[#001F3F]">{settings.inflationRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={settings.inflationRate}
            onChange={(e) => onUpdate({ ...settings, inflationRate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-[#001F3F]/20 rounded-lg appearance-none cursor-pointer accent-[#001F3F]"
          />
          <p className="text-xs text-[#001F3F]/60 mt-2 font-medium">Adjusts future value for purchasing power parity.</p>
        </div>

        <button
            onClick={onReset}
            className="w-full mt-4 py-2 px-4 rounded-lg bg-[#001F3F] hover:bg-[#001F3F]/90 text-sm text-[#D4AF37] font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
            <RefreshCw className="w-4 h-4" />
            Reset Defaults
        </button>
      </div>
    </div>
  );
};

interface DashboardProps {
  items: FinancialItem[];
  settings: AppSettings;
  onAddItem: (type: 'asset' | 'liability') => void;
  onRemoveItem: (id: string) => void;
  onUpdateSettings: (s: AppSettings) => void;
  onResetSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  items, settings, onAddItem, onRemoveItem, onUpdateSettings, onResetSettings 
}) => {
  // Calculations
  const assets = items.filter(i => i.type === 'asset');
  const liabilities = items.filter(i => i.type === 'liability');
  const totalAssets = assets.reduce((sum, i) => sum + i.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, i) => sum + i.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Projections
  const projectionData = useMemo(() => {
    const data: ProjectionData[] = [];
    let currentAssets = totalAssets;
    let currentLiabilities = totalLiabilities;

    for (let year = 0; year <= settings.projectionYears; year++) {
      data.push({
        year: new Date().getFullYear() + year,
        netWorth: currentAssets - currentLiabilities,
        assets: currentAssets,
        liabilities: currentLiabilities,
      });

      const weightedAssetRate = assets.length > 0 
        ? assets.reduce((acc, item) => acc + (item.amount * item.interestRate), 0) / (totalAssets || 1)
        : 0;
      
      const weightedLiabilityRate = liabilities.length > 0
        ? liabilities.reduce((acc, item) => acc + (item.amount * item.interestRate), 0) / (totalLiabilities || 1)
        : 0;

      const realAssetRate = ((1 + weightedAssetRate / 100) / (1 + settings.inflationRate / 100)) - 1;
      const realLiabilityRate = ((1 + weightedLiabilityRate / 100) / (1 + settings.inflationRate / 100)) - 1;

      currentAssets *= (1 + realAssetRate);
      currentLiabilities *= (1 + realLiabilityRate); 
    }
    return data;
  }, [totalAssets, totalLiabilities, assets, liabilities, settings]);

  const assetAllocationData = assets.map(a => ({ name: a.category, value: a.amount }));
  const aggregatedAssets = Object.values(assetAllocationData.reduce((acc: any, curr) => {
    acc[curr.name] = acc[curr.name] || { name: curr.name, value: 0 };
    acc[curr.name].value += curr.value;
    return acc;
  }, {}));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      
      <div className="xl:col-span-1 space-y-6">
        <div className="grid grid-cols-1 gap-4">
            <SummaryCard 
                title="Net Worth" 
                amount={netWorth} 
                type={netWorth >= 0 ? 'positive' : 'negative'} 
                icon={<Wallet className="w-5 h-5" />}
            />
            <SummaryCard 
                title="Total Assets" 
                amount={totalAssets} 
                type="neutral" 
                icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            />
            <SummaryCard 
                title="Total Liabilities" 
                amount={totalLiabilities} 
                type="neutral" 
                icon={<CreditCard className="w-5 h-5 text-rose-600" />}
            />
        </div>

        <SettingsPanel settings={settings} onUpdate={onUpdateSettings} onReset={onResetSettings} />
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Asset Allocation</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregatedAssets}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {aggregatedAssets.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Wealth Projection</h3>
                    <p className="text-sm text-slate-500">
                        {settings.projectionYears}-year forecast adjusted for {settings.inflationRate}% inflation
                    </p>
                </div>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#94a3b8'}} 
                            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                        />
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <Tooltip 
                            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNw)" name="Net Worth" />
                        <Area type="monotone" dataKey="liabilities" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDebt)" name="Liabilities" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <button 
                    onClick={() => onAddItem('asset')}
                    className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Asset
                </button>
                <FinancialList items={assets} type="asset" onRemove={onRemoveItem} />
            </div>
            <div className="space-y-4">
                <button 
                    onClick={() => onAddItem('liability')}
                    className="w-full py-2 border-2 border-dashed border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Liability
                </button>
                <FinancialList items={liabilities} type="liability" onRemove={onRemoveItem} />
            </div>
        </div>
      </div>

      <div className="xl:col-span-1 h-full min-h-[500px]">
        <AIAdvisor items={items} settings={settings} />
      </div>

    </div>
  );
};