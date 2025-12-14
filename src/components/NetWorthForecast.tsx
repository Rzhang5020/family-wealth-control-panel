import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Baby, Briefcase, GraduationCap, DollarSign, LayoutDashboard, Calendar } from 'lucide-react';
import type { ForecastSettings } from '../types';

interface NetWorthForecastProps {
  startingNetWorth: number;
  isHidden: boolean;
  onProjectionUpdate?: (year15Value: number) => void;
  settings: ForecastSettings;
  onSettingsChange: (settings: ForecastSettings) => void;
}

const NetWorthForecast: React.FC<NetWorthForecastProps> = ({ 
    startingNetWorth, 
    onProjectionUpdate,
    settings,
    onSettingsChange
}) => {
  const [activePhaseTab, setActivePhaseTab] = useState<1 | 2 | 3>(1);
  const [localActuals, setLocalActuals] = useState<Record<number, string>>({});

  const { phase1Monthly, phase2Monthly, phase3Monthly, annualReturn, startYear, customStages, customReturns } = settings;

  const updateSetting = (key: keyof ForecastSettings, value: string | number) => {
    if (typeof value === 'number') {
        onSettingsChange({ ...settings, [key]: value });
        return;
    }
    const raw = value.replace(/,/g, '');
    let val: number | '' = '';
    if (raw !== '' && !isNaN(Number(raw))) {
      val = Number(raw);
    }
    onSettingsChange({ ...settings, [key]: val });
  };

  const updateStageForYear = (yearIndex: number, stage: 1 | 2 | 3) => {
    onSettingsChange({
        ...settings,
        customStages: {
            ...settings.customStages,
            [yearIndex]: stage
        }
    });
  };

  const updateReturnForYear = (yearIndex: number, rate: string) => {
    // Fix: If input is cleared, remove the override instead of forcing the default value.
    if (rate === '') {
        const newReturns = { ...settings.customReturns };
        delete newReturns[yearIndex];
        onSettingsChange({
            ...settings,
            customReturns: newReturns
        });
        return;
    }

    const val = parseFloat(rate);
    if (!isNaN(val)) {
        onSettingsChange({
            ...settings,
            customReturns: {
                ...settings.customReturns,
                [yearIndex]: val
            }
        });
    }
  };

  const handleActualChange = (year: number, value: string) => {
    const raw = value.replace(/,/g, '');
    if (raw === '' || !isNaN(Number(raw))) {
        setLocalActuals(prev => ({
            ...prev,
            [year]: value 
        }));
    }
  };

  const displayMoney = (val: number | '') => {
    if (val === '') return '';
    return val.toLocaleString();
  };

  const projectionData = useMemo(() => {
    const data = [];
    let runningBalance = startingNetWorth;
    let totalReturnRate = 0;

    const p1 = phase1Monthly === '' ? 0 : phase1Monthly;
    const p2 = phase2Monthly === '' ? 0 : phase2Monthly;
    const p3 = phase3Monthly === '' ? 0 : phase3Monthly;
    const globalRate = annualReturn === '' ? 0 : annualReturn;

    data.push({
        yearLabel: 'Start',
        calendarYear: startYear - 1, 
        yearNum: 0, 
        netWorth: Math.round(runningBalance),
        displayValue: Math.round(runningBalance), 
        phase: 0,
        contribution: 0,
        returnRate: 0,
        actualInput: ''
    });

    for (let year = 1; year <= 15; year++) {
        let phase: 1 | 2 | 3 = 1;
        if (customStages[year]) {
            phase = customStages[year];
        } else {
            if (year <= 3) phase = 1;
            else if (year <= 8) phase = 2;
            else phase = 3;
        }

        let currentRate = globalRate;
        if (customReturns[year] !== undefined) {
            currentRate = customReturns[year];
        }
        totalReturnRate += currentRate;

        let monthlyContribution = 0;
        if (phase === 1) monthlyContribution = p1;
        else if (phase === 2) monthlyContribution = p2;
        else monthlyContribution = p3;

        const annualContribution = monthlyContribution * 12;
        const r = currentRate / 100;
        
        // Formula: EOY = BOY * (1 + r) + AnnualContribution * (1 + r/2)
        const projectedEnd = (runningBalance * (1 + r)) + (annualContribution * (1 + r / 2));

        const actualStr = localActuals[year];
        const actualVal = actualStr && actualStr !== '' ? parseFloat(actualStr.replace(/,/g, '')) : null;
        
        const closingBalance = actualVal !== null ? actualVal : projectedEnd;

        data.push({
            yearLabel: `Yr ${year}`,
            calendarYear: startYear + (year - 1),
            yearNum: year,
            netWorth: Math.round(projectedEnd),
            displayValue: Math.round(closingBalance),
            phase: phase,
            contribution: monthlyContribution,
            returnRate: currentRate,
            actualInput: actualStr || ''
        });

        runningBalance = closingBalance;
    }
    
    const avgRate = totalReturnRate / 15;
    
    return { data, avgRate };
  }, [startingNetWorth, phase1Monthly, phase2Monthly, phase3Monthly, annualReturn, localActuals, startYear, customStages, customReturns]);

  useEffect(() => {
    if (onProjectionUpdate && projectionData.data.length > 15) {
        const val = projectionData.data[15].displayValue;
        if (typeof val === 'number') {
            onProjectionUpdate(val);
        }
    }
  }, [projectionData, onProjectionUpdate]);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600"/> 3-Stage Lifecycle Benchmark
            </h3>
            <p className="text-sm text-slate-500">
                Life changes. Adjust your monthly investment strategy based on your family stage.
            </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Start Year:</span>
            <input 
                type="number"
                value={startYear}
                onChange={(e) => updateSetting('startYear', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
      </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
            {/* Phase 1 Tab */}
            <button 
                onClick={() => setActivePhaseTab(1)}
                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${activePhaseTab === 1 ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Stage 1: Foundation</span>
                    <Baby className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-xs text-slate-500 mb-3">Default: Years 1-3</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase1Monthly)}
                        onChange={(e) => updateSetting('phase1Monthly', e.target.value)}
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
                <div className="text-xs text-slate-500 mb-3">Default: Years 4-8</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase2Monthly)}
                        onChange={(e) => updateSetting('phase2Monthly', e.target.value)}
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
                <div className="text-xs text-slate-500 mb-3">Default: Years 9-15</div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        value={displayMoney(phase3Monthly)}
                        onChange={(e) => updateSetting('phase3Monthly', e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Inv.</div>
            </button>
        </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 print:border-slate-300 print:break-inside-avoid">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2 print:bg-slate-100">
            <LayoutDashboard className="w-4 h-4" />
            Milestone Tracker (Your Road Map)
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Timeline</th>
                        <th className="px-4 py-3 bg-slate-200/50">Year</th>
                        <th className="px-4 py-3">Life Stage</th>
                        <th className="px-4 py-3">Monthly Inv.</th>
                        <th className="px-4 py-3 bg-yellow-50 print:bg-yellow-50/20">Annual Return</th>
                        <th className="px-4 py-3">Projected Total</th>
                        <th className="px-4 py-3 w-48 no-print">Graph Override</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    {projectionData.data.slice(1).map((row, index) => (
                        <tr key={index} className={`hover:bg-slate-50 ${row.actualInput ? 'bg-green-50/50' : ''} print:bg-white`}>
                            <td className="px-4 py-4 font-medium text-slate-500">{row.yearLabel}</td>
                            <td className="px-4 py-4 font-bold text-slate-900 bg-slate-50/50 print:bg-transparent">{row.calendarYear}</td>
                            <td className="px-4 py-3">
                                <select 
                                    value={row.phase}
                                    onChange={(e) => updateStageForYear(row.yearNum, parseInt(e.target.value) as 1|2|3)}
                                    className={`text-xs font-bold px-2 py-1 rounded border-none outline-none cursor-pointer appearance-none pr-6 bg-no-repeat bg-[right_0.5rem_center] no-print
                                        ${row.phase === 1 ? 'bg-blue-50 text-blue-600' : 
                                          row.phase === 2 ? 'bg-orange-50 text-orange-600' : 
                                          'bg-purple-50 text-purple-600'}`}
                                    style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                                >
                                    <option value={1}>Stage 1: Foundation</option>
                                    <option value={2}>Stage 2: Discipline</option>
                                    <option value={3}>Stage 3: Velocity</option>
                                </select>
                                <span className="hidden print:inline text-xs font-bold uppercase tracking-wider">
                                    {row.phase === 1 ? 'Foundation' : row.phase === 2 ? 'Discipline' : 'Velocity'}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-slate-500">
                                ${row.contribution?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 bg-yellow-50/50 print:bg-transparent">
                                <div className="relative w-20">
                                    <input 
                                        type="number" 
                                        value={customReturns[row.yearNum] !== undefined ? customReturns[row.yearNum] : ''}
                                        placeholder={annualReturn !== '' ? annualReturn.toString() : '0'}
                                        onChange={(e) => updateReturnForYear(row.yearNum, e.target.value)}
                                        className="w-full pl-2 pr-6 py-1 border border-yellow-200 rounded text-xs font-bold text-center focus:ring-2 focus:ring-yellow-400 outline-none bg-white print:border-none print:px-0 print:text-left placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                    <span className="absolute right-2 top-1.5 text-slate-400 text-xs no-print">%</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-mono text-emerald-700 font-bold">
                                ${row.netWorth.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 no-print">
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                                    <input 
                                        type="text"
                                        placeholder="Optional"
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

      {/* CHART SECTION */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Your Wealth Trajectory</h3>
                <div className="flex items-center gap-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 print:bg-transparent print:border-none">
                    <span className="text-sm font-medium text-slate-500">Avg Return (Calculated):</span>
                    <span className="text-lg font-bold text-slate-800">
                        {projectionData.avgRate.toFixed(2)}%
                    </span>
                    <div className="flex items-center gap-2 no-print">
                        <input 
                            type="text" 
                            value={annualReturn}
                            onChange={(e) => updateSetting('annualReturn', e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-sm text-center font-bold"
                        />
                        <span className="text-sm text-slate-500">%</span>
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={12} />
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