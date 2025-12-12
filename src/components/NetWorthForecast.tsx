import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Baby, Briefcase, GraduationCap, DollarSign, LayoutDashboard } from 'lucide-react';

interface NetWorthForecastProps {
  startingNetWorth: number;
  isHidden: boolean;
  onProjectionUpdate?: (year15Value: number) => void;
  importedMonthlyContribution?: number | null;
}

const NetWorthForecast: React.FC<NetWorthForecastProps> = ({ 
    startingNetWorth, 
    isHidden, 
    onProjectionUpdate,
    importedMonthlyContribution 
}) => {
  // --- DASHBOARD (3-STAGE) STATE ---
  // We use number | '' to allow empty inputs without forcing a '0'
  const [phase1Monthly, setPhase1Monthly] = useState<number | ''>(3000); // Years 1-3
  const [phase2Monthly, setPhase2Monthly] = useState<number | ''>(1500); // Years 4-8
  const [phase3Monthly, setPhase3Monthly] = useState<number | ''>(4000); // Years 9-15
  const [annualReturn, setAnnualReturn] = useState<number | ''>(8);
  const [activePhaseTab, setActivePhaseTab] = useState<1 | 2 | 3>(1);
  
  // Actuals State (Rolling Forecast)
  const [actuals, setActuals] = useState<Record<number, string>>({});

  // Effect to handle imported capacity from the previous tab
  useEffect(() => {
    if (importedMonthlyContribution !== null && importedMonthlyContribution !== undefined) {
        setPhase1Monthly(importedMonthlyContribution);
    }
  }, [importedMonthlyContribution]);

  // Helper for Input Change with Commas
  const handleMoneyInputChange = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    const raw = value.replace(/,/g, '');
    if (raw === '') {
        setter('');
    } else if (!isNaN(Number(raw))) {
        setter(Number(raw));
    }
  };

  const handleActualChange = (year: number, value: string) => {
    // Only allow numbers and commas
    const raw = value.replace(/,/g, '');
    if (raw === '' || !isNaN(Number(raw))) {
        setActuals(prev => ({
            ...prev,
            [year]: value // Keep the formatted string in state for this specific map, logic handles parsing
        }));
    }
  };

  // Helper to display commas in value prop
  const displayMoney = (val: number | '') => {
    if (val === '') return '';
    return val.toLocaleString();
  };

  const projectionData = useMemo(() => {
    const data = [];
    let runningBalance = startingNetWorth;

    // Use safe defaults for calculations if inputs are empty
    const p1 = phase1Monthly === '' ? 0 : phase1Monthly;
    const p2 = phase2Monthly === '' ? 0 : phase2Monthly;
    const p3 = phase3Monthly === '' ? 0 : phase3Monthly;
    const ret = annualReturn === '' ? 0 : annualReturn;

    // Push Start
    // FIX: Added displayValue, yearNum, and contribution to initial object so TS infers consistent shape
    data.push({
        year: 'Start',
        yearNum: 0, 
        netWorth: Math.round(runningBalance),
        displayValue: Math.round(runningBalance), 
        phase: 0,
        contribution: 0,
        actualInput: ''
    });

    for (let year = 1; year <= 15; year++) {
        let monthlyContribution = 0;
        let phase = 0;

        if (year <= 3) {
            monthlyContribution = p1;
            phase = 1;
        } else if (year <= 8) {
            monthlyContribution = p2;
            phase = 2;
        } else {
            monthlyContribution = p3;
            phase = 3;
        }

        const annualContribution = monthlyContribution * 12;
        
        const growth = runningBalance * (ret / 100);
        const projectedEnd = runningBalance + growth + annualContribution;

        // Check if user has an override for this year
        const actualStr = actuals[year];
        // Parse the comma-separated string for math
        const actualVal = actualStr && actualStr !== '' ? parseFloat(actualStr.replace(/,/g, '')) : null;
        
        // The value we carry forward to the next loop iteration
        const closingBalance = actualVal !== null ? actualVal : projectedEnd;

        data.push({
            year: `Yr ${year}`,
            yearNum: year,
            netWorth: Math.round(projectedEnd), // Projected
            displayValue: Math.round(closingBalance), // Graph Value
            phase: phase,
            contribution: monthlyContribution,
            actualInput: actualStr || ''
        });

        runningBalance = closingBalance;
    }
    return data;
  }, [startingNetWorth, phase1Monthly, phase2Monthly, phase3Monthly, annualReturn, actuals]);

  // Notify parent of the final projected value for the header display
  useEffect(() => {
    if (onProjectionUpdate && projectionData.length > 15) {
        // Safe access check
        const val = projectionData[15].displayValue;
        if (typeof val === 'number') {
            onProjectionUpdate(val);
        }
    }
  }, [projectionData, onProjectionUpdate]);

  if (isHidden) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      <div className="mb-8">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600"/> 3-Stage Lifecycle Benchmark
        </h3>
        <p className="text-sm text-slate-500 mb-6">
            Life changes. Adjust your monthly investment strategy based on your family stage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phase 1 Tab */}
            <button 
                onClick={() => setActivePhaseTab(1)}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${activePhaseTab === 1 ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Stage 1: Foundation</span>
                    <Baby className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-xs text-slate-500 mb-3">Years 1-3 (Aggressive/Pre-Kids)</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase1Monthly)}
                        onChange={(e) => handleMoneyInputChange(e.target.value, setPhase1Monthly)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Inv.</div>
            </button>

            {/* Phase 2 Tab */}
            <button 
                onClick={() => setActivePhaseTab(2)}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${activePhaseTab === 2 ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Stage 2: Discipline</span>
                    <Briefcase className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-xs text-slate-500 mb-3">Years 4-8 (Daycare/High Exp)</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase2Monthly)}
                        onChange={(e) => handleMoneyInputChange(e.target.value, setPhase2Monthly)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Inv.</div>
            </button>

            {/* Phase 3 Tab */}
            <button 
                onClick={() => setActivePhaseTab(3)}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${activePhaseTab === 3 ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Stage 3: Velocity</span>
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-xs text-slate-500 mb-3">Years 9-15 (Post-Daycare/Peak)</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase3Monthly)}
                        onChange={(e) => handleMoneyInputChange(e.target.value, setPhase3Monthly)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Inv.</div>
            </button>
        </div>
      </div>

      {/* TABLE SECTION (Moved above chart as requested) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Milestone Tracker (Your Road Map)
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Timeline</th>
                        <th className="px-4 py-3">Life Stage</th>
                        <th className="px-4 py-3">Monthly Inv.</th>
                        <th className="px-4 py-3">Projected Total</th>
                        <th className="px-4 py-3 w-48">Actual Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {projectionData.slice(1).map((row, index) => (
                        <tr key={index} className={`hover:bg-slate-50 ${row.actualInput ? 'bg-green-50/50' : ''}`}>
                            <td className="px-4 py-4 font-medium text-slate-900">{row.year}</td>
                            <td className="px-4 py-4">
                                {row.phase === 1 && <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Stage 1: Foundation</span>}
                                {row.phase === 2 && <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Stage 2: Discipline</span>}
                                {row.phase === 3 && <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Stage 3: Velocity</span>}
                            </td>
                            <td className="px-4 py-4 text-slate-500">
                                ${row.contribution?.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 font-mono text-emerald-700 font-bold">
                                ${row.netWorth.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                                    <input 
                                        type="text"
                                        placeholder="Enter Actual"
                                        className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        value={row.actualInput ? Number(row.actualInput.replace(/,/g, '')).toLocaleString() : ''}
                                        onChange={(e) => handleActualChange(row.yearNum || 0, e.target.value)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* CHART SECTION (Moved below table) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Your Wealth Trajectory</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Avg Return:</span>
                    <input 
                        type="text" 
                        value={annualReturn}
                        onChange={(e) => {
                            const val = e.target.value.replace(/,/g, '');
                            if (val === '') setAnnualReturn('');
                            else if (!isNaN(Number(val))) setAnnualReturn(Number(val));
                        }}
                        className="w-16 px-2 py-1 border rounded text-sm text-center font-bold"
                    />
                    <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                            labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="displayValue" 
                            stroke="#059669" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorNw)"
                            activeDot={{ r: 8 }} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
      </div>

    </div>
  );
};

export default NetWorthForecast;