import React, { useState, useMemo } from 'react';
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
  // --- STATE ---
  const [incomeItems, setIncomeItems] = useState<BudgetItem[]>([
    { id: '1', name: 'Primary W-2 Net Pay (You)', value: 5000 },
    { id: '2', name: 'Secondary W-2 Net Pay (Partner)', value: 4000 },
    { id: '3', name: 'Rental Income (Net Profit)', value: 0 },
    { id: '4', name: 'Investment Income (Div/Int)', value: 0 },
    { id: '5', name: 'Bonuses (Avg Monthly)', value: 0 },
    { id: '6', name: 'Side Income', value: 0 },
    { id: '7', name: 'Other / Temporary', value: 0 },
  ]);

  const [fixedExpenses, setFixedExpenses] = useState<BudgetItem[]>([
    { id: '1', name: 'Mortgage or Rent', value: 2500 },
    { id: '2', name: 'Car Payment', value: 450 },
    { id: '3', name: 'Utilities (Elec/Gas/Water/Net)', value: 300 },
    { id: '4', name: 'Insurances (Health/Life)', value: 150 },
    { id: '5', name: 'Other Debt Payments', value: 200 },
  ]);

  const [variableExpenses, setVariableExpenses] = useState<BudgetItem[]>([
    { id: '1', name: 'Grocery & Food', value: 800 },
    { id: '2', name: 'Restaurants / Going Out', value: 300 },
    { id: '3', name: 'Subscriptions (Spotify/Netflix)', value: 50 },
    { id: '4', name: 'Shopping / Amazon', value: 200 },
    { id: '5', name: 'Travel / Vacation Fund', value: 200 },
    { id: '6', name: 'Kids Activities/Stuff', value: 150 },
  ]);

  const [hellExpenses, setHellExpenses] = useState<BudgetItem[]>([
    { id: '1', name: 'Daycare / Tuition', value: 1200 },
    { id: '2', name: 'Renovations / Repairs', value: 0 },
    { id: '3', name: 'Medical Bills', value: 0 },
    { id: '4', name: 'Elder Care', value: 0 },
    { id: '5', name: 'Legal Fees', value: 0 },
    { id: '6', name: 'Disaster / Emergency', value: 0 },
  ]);

  const [stretchPct, setStretchPct] = useState(80); // Default stretch percentage

  // --- HELPERS ---
  const handleUpdate = (
    list: BudgetItem[], 
    setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>, 
    id: string, 
    field: 'name' | 'value', 
    newValue: string | number
  ) => {
    setList(list.map(item => item.id === id ? { ...item, [field]: newValue } : item));
  };

  const handleAdd = (list: BudgetItem[], setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>) => {
    setList([...list, { id: Date.now().toString(), name: 'New Item', value: 0 }]);
  };

  const handleRemove = (list: BudgetItem[], setList: React.Dispatch<React.SetStateAction<BudgetItem[]>>, id: string) => {
    setList(list.filter(item => item.id !== id));
  };

  const sumList = (list: BudgetItem[]) => list.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Helper to format number with commas
  const formatValue = (val: number) => {
    if (val === 0) return '';
    return val.toLocaleString();
  };

  // --- CALCULATIONS ---
  const totalIncome = useMemo(() => sumList(incomeItems), [incomeItems]);
  const totalFixed = useMemo(() => sumList(fixedExpenses), [fixedExpenses]);
  const totalVariable = useMemo(() => sumList(variableExpenses), [variableExpenses]);
  const totalHell = useMemo(() => sumList(hellExpenses), [hellExpenses]);

  const totalExpenses = totalFixed + totalVariable + totalHell;
  const monthlySurplus = totalIncome - totalExpenses;
  
  const safeCapacity = monthlySurplus > 0 ? monthlySurplus * 0.65 : 0;
  const stretchCapacity = monthlySurplus > 0 ? monthlySurplus * (stretchPct / 100) : 0;

  // --- RENDER SECTION ---
  const renderSection = (
    title: string, 
    colorClass: string, 
    items: BudgetItem[], 
    setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>,
    total: number
  ) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6 print:border-slate-300 print:break-inside-avoid">
      <div className={`p-3 border-b border-slate-100 flex justify-between items-center ${colorClass} bg-opacity-10 print:bg-slate-100`}>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <span className={`font-mono font-bold ${colorClass} print:text-black`}>${total.toLocaleString()}</span>
      </div>
      <div className="p-4 space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            <input 
              type="text" 
              value={item.name}
              onChange={(e) => handleUpdate(items, setItems, item.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 outline-none print:border-none print:px-0"
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
                  className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded text-sm text-right focus:ring-1 focus:ring-slate-400 outline-none print:border-none print:px-0"
                />
            </div>
            <button onClick={() => handleRemove(items, setItems, item.id)} className="text-slate-300 hover:text-red-500 no-print">
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
            onClick={() => handleAdd(items, setItems)}
            className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-2 hover:text-slate-800 no-print"
        >
            <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 p-6">
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8 flex items-start gap-3 no-print">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
                <h3 className="font-bold text-blue-900">How much can you actually invest?</h3>
                <p className="text-sm text-blue-800">
                    Use this worksheet to find your "Safe Number." The amount you can invest without blowing up your life when the car breaks down or the roof leaks.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN: INPUTS */}
            <div>
                {renderSection("1. Monthly Income", "text-emerald-600", incomeItems, setIncomeItems, totalIncome)}
                {renderSection("2. Fixed Expenses (Needs)", "text-red-600", fixedExpenses, setFixedExpenses, totalFixed)}
                {renderSection("3. Variable Expenses (Lifestyle)", "text-orange-600", variableExpenses, setVariableExpenses, totalVariable)}
                {renderSection("4. Temporary Hell (Season of Life)", "text-purple-600", hellExpenses, setHellExpenses, totalHell)}
            </div>

            {/* RIGHT COLUMN: OUTPUT DASHBOARD */}
            <div className="md:sticky md:top-6 h-fit">
                <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden print:bg-white print:text-black print:border print:border-slate-300 print:shadow-none print:break-inside-avoid">
                    <div className="p-6 border-b border-slate-800 print:border-slate-300">
                        <h3 className="text-lg font-serif font-bold text-emerald-400 flex items-center gap-2 print:text-black">
                            <TrendingUp className="w-5 h-5" /> Investment Capacity
                        </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Surplus Calculation */}
                        <div className="flex justify-between items-end border-b border-slate-800 pb-4 print:border-slate-300">
                            <div className="text-slate-400 text-sm print:text-slate-600">Monthly Net Income</div>
                            <div className="font-mono text-emerald-400 print:text-black">+{totalIncome.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-800 pb-4 print:border-slate-300">
                            <div className="text-slate-400 text-sm print:text-slate-600">Total Outflow</div>
                            <div className="font-mono text-red-400 print:text-black">-{totalExpenses.toLocaleString()}</div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg text-center print:bg-slate-100">
                            <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">True Monthly Surplus</div>
                            <div className={`text-3xl font-bold ${monthlySurplus > 0 ? 'text-white print:text-black' : 'text-red-500'}`}>
                                ${monthlySurplus.toLocaleString()}
                            </div>
                        </div>

                        {/* Capacity Outputs */}
                        <div className="space-y-4 pt-2">
                            <div className="bg-emerald-900/30 border border-emerald-900/50 p-4 rounded-lg print:bg-white print:border-slate-300">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-bold text-emerald-200 print:text-black">Safe Capacity (65%)</div>
                                    <div className="text-xs text-emerald-400/70 print:hidden">Recommended</div>
                                </div>
                                <div className="text-2xl font-bold text-emerald-400 print:text-black">${Math.round(safeCapacity).toLocaleString()}</div>
                                <div className="text-xs text-emerald-500 mt-1 print:hidden">Leaves 35% buffer for chaos.</div>
                            </div>

                            <div className="bg-indigo-900/30 border border-indigo-900/50 p-4 rounded-lg print:bg-white print:border-slate-300">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-bold text-indigo-200 print:text-black">Stretch Capacity</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-indigo-300 no-print">{stretchPct}%</span>
                                        <input 
                                            type="range" 
                                            min="65" 
                                            max="100" 
                                            value={stretchPct} 
                                            onChange={(e) => setStretchPct(parseInt(e.target.value))}
                                            className="w-20 h-1 bg-indigo-900 rounded-lg appearance-none cursor-pointer no-print"
                                        />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-indigo-400 print:text-black">${Math.round(stretchCapacity).toLocaleString()}</div>
                                <div className="text-xs text-indigo-500 mt-1 print:hidden">Aggressive investing (Low buffer).</div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-4 space-y-3 no-print">
                            <button 
                                onClick={() => onApplyToForecast(Math.round(safeCapacity))}
                                disabled={safeCapacity <= 0}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send "Safe" Amount to Forecast <ArrowRight className="w-4 h-4" />
                            </button>
                            
                            <button 
                                onClick={() => onApplyToForecast(Math.round(stretchCapacity))}
                                disabled={stretchCapacity <= 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send "Stretch" Amount to Forecast <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-center text-xs text-slate-500 mt-2">
                                Sets your "Stage 1" contribution in the 15-Year Plan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InvestmentCapacity;