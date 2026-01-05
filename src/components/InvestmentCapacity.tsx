import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetItem {
  id: string;
  name: string;
  value: number;
}

interface InvestmentCapacityProps {
  isHidden: boolean;
  onApplyToForecast: (amount: number) => void;
}

const InvestmentCapacity: React.FC<InvestmentCapacityProps> = ({ isHidden, onApplyToForecast }) => {
  
  const [incomeItems, setIncomeItems] = useState<BudgetItem[]>(() => {
    try {
        const saved = localStorage.getItem('fwcp_cap_income');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Primary W-2 Net Pay (You)', value: 5000 },
            { id: '2', name: 'Secondary W-2 Net Pay (Partner)', value: 4000 },
            { id: '3', name: 'Rental Income (Net Profit)', value: 0 },
            { id: '4', name: 'Investment Income (Div/Int)', value: 0 },
            { id: '5', name: 'Bonuses (Avg Monthly)', value: 0 },
            { id: '6', name: 'Side Income', value: 0 },
            { id: '7', name: 'Other / Temporary', value: 0 },
        ];
    } catch { return []; }
  });

  const [fixedExpenses, setFixedExpenses] = useState<BudgetItem[]>(() => {
    try {
        const saved = localStorage.getItem('fwcp_cap_fixed');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Mortgage or Rent', value: 2500 },
            { id: '2', name: 'Car Payment', value: 450 },
            { id: '3', name: 'Utilities (Elec/Gas/Water/Net)', value: 300 },
            { id: '4', name: 'Insurances (Health/Life)', value: 150 },
            { id: '5', name: 'Other Debt Payments', value: 200 },
        ];
    } catch { return []; }
  });

  const [variableExpenses, setVariableExpenses] = useState<BudgetItem[]>(() => {
    try {
        const saved = localStorage.getItem('fwcp_cap_variable');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Grocery & Food', value: 800 },
            { id: '2', name: 'Restaurants / Going Out', value: 300 },
            { id: '3', name: 'Subscriptions (Spotify/Netflix)', value: 50 },
            { id: '4', name: 'Shopping / Amazon', value: 200 },
            { id: '5', name: 'Travel / Vacation Fund', value: 200 },
            { id: '6', name: 'Kids Activities/Stuff', value: 150 },
        ];
    } catch { return []; }
  });

  const [hellExpenses, setHellExpenses] = useState<BudgetItem[]>(() => {
    try {
        const saved = localStorage.getItem('fwcp_cap_hell');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Daycare / Tuition', value: 1200 },
            { id: '2', name: 'Renovations / Repairs', value: 0 },
            { id: '3', name: 'Medical Bills', value: 0 },
            { id: '4', name: 'Elder Care', value: 0 },
            { id: '5', name: 'Legal Fees', value: 0 },
            { id: '6', name: 'Disaster / Emergency', value: 0 },
        ];
    } catch { return []; }
  });

  const [stretchPct, setStretchPct] = useState(() => {
    try {
        const saved = localStorage.getItem('fwcp_cap_stretch');
        return saved ? parseInt(saved) : 80;
    } catch { return 80; }
  });

  useEffect(() => localStorage.setItem('fwcp_cap_income', JSON.stringify(incomeItems)), [incomeItems]);
  useEffect(() => localStorage.setItem('fwcp_cap_fixed', JSON.stringify(fixedExpenses)), [fixedExpenses]);
  useEffect(() => localStorage.setItem('fwcp_cap_variable', JSON.stringify(variableExpenses)), [variableExpenses]);
  useEffect(() => localStorage.setItem('fwcp_cap_hell', JSON.stringify(hellExpenses)), [hellExpenses]);
  useEffect(() => localStorage.setItem('fwcp_cap_stretch', stretchPct.toString()), [stretchPct]);

  const handleUpdate = (list: BudgetItem[], setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>, id: string, field: 'name' | 'value', newValue: string | number) => {
    setList(list.map(item => item.id === id ? { ...item, [field]: newValue } : item));
  };

  const handleAdd = (list: BudgetItem[], setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>) => {
    setList([...list, { id: Date.now().toString(), name: 'New Item', value: 0 }]);
  };

  const handleRemove = (list: BudgetItem[], setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>, id: string) => {
    setList(list.filter(item => item.id !== id));
  };

  const sumList = (list: BudgetItem[]) => list.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const formatValue = (val: number) => {
    if (val === 0) return '';
    return val.toLocaleString();
  };

  const totalIncome = useMemo(() => sumList(incomeItems), [incomeItems]);
  const totalFixed = useMemo(() => sumList(fixedExpenses), [fixedExpenses]);
  const totalVariable = useMemo(() => sumList(variableExpenses), [variableExpenses]);
  const totalHell = useMemo(() => sumList(hellExpenses), [hellExpenses]);

  const totalExpenses = totalFixed + totalVariable + totalHell;
  const monthlySurplus = totalIncome - totalExpenses;
  
  const safeCapacity = monthlySurplus > 0 ? monthlySurplus * 0.65 : 0;
  const stretchCapacity = monthlySurplus > 0 ? monthlySurplus * (stretchPct / 100) : 0;

  const renderSection = (title: string, colorClass: string, items: BudgetItem[], setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>, total: number) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6 print:border-slate-300">
      <div className={`p-3 border-b border-slate-100 flex justify-between items-center bg-playbookBlue/5`}>
        <h3 className="font-bold text-playbookBlue">{title}</h3>
        <span className={`font-mono font-bold text-playbookBlue`}>${total.toLocaleString()}</span>
      </div>
      <div className="p-4 space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            <input 
              type="text" 
              value={item.name}
              onChange={(e) => handleUpdate(items, setItems, item.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-playbookGold outline-none"
            />
            <div className="relative w-32">
                <span className="absolute left-2 top-2 text-slate-400 text-sm no-print">$</span>
                <input 
                  type="text" 
                  value={formatValue(item.value)}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '');
                    if (!isNaN(Number(raw))) {
                        handleUpdate(items, setItems, item.id, 'value', parseFloat(raw) || 0);
                    }
                  }}
                  className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded text-sm text-right focus:ring-1 focus:ring-playbookGold outline-none"
                />
            </div>
            <button onClick={() => handleRemove(items, setItems, item.id)} className="text-slate-300 hover:text-rose-500 no-print">
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
            onClick={() => handleAdd(items, setItems)}
            className="text-xs font-bold text-playbookBlue/60 flex items-center gap-1 mt-2 hover:text-playbookBlue no-print"
        >
            <Plus className="w-3 h-3 text-playbookGold" /> Add Item
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 p-6">
        
        <div className="bg-playbookBlue/5 border border-playbookBlue/10 p-4 rounded-lg mb-8 flex items-start gap-3 no-print">
            <AlertCircle className="w-5 h-5 text-playbookBlue mt-0.5 shrink-0" />
            <div>
                <h3 className="font-bold text-playbookBlue">Find your investable surplus.</h3>
                <p className="text-sm text-playbookBlue/70">
                    Use this worksheet to determine your "Safe Capacity"—the amount you can deploy toward growth while maintaining a family safety buffer.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                {renderSection("1. Monthly Net Income", "text-playbookBlue", incomeItems, setIncomeItems, totalIncome)}
                {renderSection("2. Fixed Expenses (Needs)", "text-playbookBlue", fixedExpenses, setFixedExpenses, totalFixed)}
                {renderSection("3. Lifestyle (Variable)", "text-playbookBlue", variableExpenses, setVariableExpenses, totalVariable)}
                {renderSection("4. Seasonal Hell (Temporary)", "text-playbookBlue", hellExpenses, setHellExpenses, totalHell)}
            </div>

            <div className="md:sticky md:top-6 h-fit">
                <div className="bg-playbookBlue text-white rounded-xl shadow-xl overflow-hidden print:text-playbookBlue print:bg-white print:border">
                    <div className="p-6 border-b border-white/10 print:border-playbookBlue/20">
                        <h3 className="text-lg font-serif font-bold text-playbookGold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Investment Capacity
                        </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4 print:border-playbookBlue/20">
                            <div className="text-slate-400 text-sm print:text-playbookBlue/60">Monthly Net Income</div>
                            <div className="font-mono text-white print:text-playbookBlue">+${totalIncome.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4 print:border-playbookBlue/20">
                            <div className="text-slate-400 text-sm print:text-playbookBlue/60">Total Expenses</div>
                            <div className="font-mono text-white print:text-playbookBlue">-${totalExpenses.toLocaleString()}</div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg text-center print:bg-slate-100">
                            <div className="text-xs uppercase tracking-wider font-bold text-playbookGold mb-1">True Monthly Surplus</div>
                            <div className={`text-3xl font-bold ${monthlySurplus > 0 ? 'text-white print:text-playbookBlue' : 'text-rose-500'}`}>
                                ${monthlySurplus.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="bg-playbookGold/10 border border-playbookGold/20 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-bold text-playbookGold">Safe Capacity (65%)</div>
                                    <div className="text-[10px] text-playbookGold/60 uppercase tracking-widest print:hidden">Recommended</div>
                                </div>
                                <div className="text-2xl font-bold text-white print:text-playbookBlue">${Math.round(safeCapacity).toLocaleString()}</div>
                                <div className="text-xs text-playbookGold/70 mt-1 print:hidden">Maintains a 35% monthly buffer for volatility.</div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-bold text-slate-300">Stretch Capacity</div>
                                    <div className="flex items-center gap-2 no-print">
                                        <span className="text-xs text-slate-400">{stretchPct}%</span>
                                        <input type="range" min="65" max="100" value={stretchPct} onChange={(e) => setStretchPct(parseInt(e.target.value))} className="w-20 h-1 bg-playbookGold rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white print:text-playbookBlue">${Math.round(stretchCapacity).toLocaleString()}</div>
                                <div className="text-xs text-slate-500 mt-1 print:hidden">Higher utilization, lower margin for error.</div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3 no-print">
                            <button onClick={() => onApplyToForecast(Math.round(safeCapacity))} disabled={safeCapacity <= 0} className="w-full bg-playbookGold text-playbookBlue font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-playbookGold/90">
                                Deploy "Safe" Amount <ArrowRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => onApplyToForecast(Math.round(stretchCapacity))} disabled={stretchCapacity <= 0} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20">
                                Deploy "Stretch" Amount <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InvestmentCapacity;