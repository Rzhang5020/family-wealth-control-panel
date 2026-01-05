import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Baby, Briefcase, GraduationCap, DollarSign, LayoutDashboard, Calendar, ArrowRight } from 'lucide-react';
import type { ForecastSettings } from '../types';

interface NetWorthForecastProps {
  startingNetWorth: number;
  isHidden: boolean;
  onProjectionUpdate?: (year15Value: number) => void;
  settings: ForecastSettings;
  onSettingsChange: (settings: ForecastSettings) => void;
  onNext?: () => void;
}

const NetWorthForecast: React.FC<NetWorthForecastProps> = ({ 
    startingNetWorth, 
    onProjectionUpdate,
    settings,
    onSettingsChange,
    onNext
}) => {
  const [activePhaseTab, setActivePhaseTab] = useState<1 | 2 | 3>(1);
  
  const [localActuals, setLocalActuals] = useState<Record<number, string>>(() => {
    try {
        const saved = localStorage.getItem('fwcp_forecast_overrides');
        return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('fwcp_forecast_overrides', JSON.stringify(localActuals));
  }, [localActuals]);

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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
            <h3 className="font-bold text-playbookBlue flex items-center gap-2">
                <Target className="w-5 h-5 text-playbookGold"/> Milestone Tracker
            </h3>
            <p className="text-sm text-slate-500">
                Adjust your growth engine by stage of life.
            </p>
        </div>
        <div className="flex items-center gap-2 bg-playbookBlue/5 p-2 rounded-lg border border-playbookBlue/10">
            <Calendar className="w-4 h-4 text-playbookBlue" />
            <span className="text-sm font-bold text-playbookBlue">Start Year:</span>
            <input 
                type="number"
                value={startYear}
                onChange={(e) => updateSetting('startYear', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-playbookGold"
            />
        </div>
      </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
            {/* Stage Cards */}
            <div className={`p-4 rounded-xl border-2 text-left bg-white border-playbookBlue/10`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-playbookBlue">Stage 1: Foundation</span>
                    <Baby className="w-5 h-5 text-playbookGold" />
                </div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input type="text" value={displayMoney(phase1Monthly)} onChange={(e) => updateSetting('phase1Monthly', e.target.value)} placeholder="0" className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-playbookGold outline-none" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Deployment</div>
            </div>

            <div className={`p-4 rounded-xl border-2 text-left bg-white border-playbookBlue/10`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-playbookBlue">Stage 2: Discipline</span>
                    <Briefcase className="w-5 h-5 text-playbookGold" />
                </div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input type="text" value={displayMoney(phase2Monthly)} onChange={(e) => updateSetting('phase2Monthly', e.target.value)} placeholder="0" className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-playbookGold outline-none" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Deployment</div>
            </div>

            <div className={`p-4 rounded-xl border-2 text-left bg-white border-playbookBlue/10`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-playbookBlue">Stage 3: Velocity</span>
                    <GraduationCap className="w-5 h-5 text-playbookGold" />
                </div>
                <div className="relative">
                    <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                    <input type="text" value={displayMoney(phase3Monthly)} onChange={(e) => updateSetting('phase3Monthly', e.target.value)} placeholder="0" className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-playbookGold outline-none" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Monthly Deployment</div>
            </div>
        </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
        <div className="p-4 bg-playbookBlue border-b border-playbookGold/20 font-bold text-playbookGold flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Milestone Projection Table
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-playbookBlue/5 text-playbookBlue uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Timeline</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Life Stage</th>
                        <th className="px-4 py-3">Monthly Inv.</th>
                        <th className="px-4 py-3">Ann. Return</th>
                        <th className="px-4 py-3">Projected Total</th>
                        <th className="px-4 py-3 no-print">Override</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {projectionData.data.slice(1).map((row, index) => (
                        <tr key={index} className={`hover:bg-slate-50`}>
                            <td className="px-4 py-4 font-medium text-slate-500">{row.yearLabel}</td>
                            <td className="px-4 py-4 font-bold text-playbookBlue">{row.calendarYear}</td>
                            <td className="px-4 py-3">
                                <select 
                                    value={row.phase}
                                    onChange={(e) => updateStageForYear(row.yearNum, parseInt(e.target.value) as 1|2|3)}
                                    className={`text-xs font-bold px-2 py-1 rounded border border-slate-200 bg-white text-playbookBlue outline-none focus:ring-1 focus:ring-playbookGold no-print`}
                                >
                                    <option value={1}>Foundation</option>
                                    <option value={2}>Discipline</option>
                                    <option value={3}>Velocity</option>
                                </select>
                                <span className="hidden print:inline text-xs font-bold uppercase">{row.phase}</span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">${row.contribution?.toLocaleString()}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <input type="number" value={customReturns[row.yearNum] !== undefined ? customReturns[row.yearNum] : ''} placeholder={annualReturn.toString()} onChange={(e) => updateReturnForYear(row.yearNum, e.target.value)} className="w-12 border-b border-playbookGold/40 text-center text-xs font-bold text-playbookBlue outline-none" />
                                    <span className="text-[10px] text-slate-400">%</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-mono text-playbookBlue font-bold">${row.netWorth.toLocaleString()}</td>
                            <td className="px-4 py-3 no-print">
                                <input type="text" placeholder="Actual?" className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-playbookGold" value={row.actualInput ? Number(row.actualInput.replace(/,/g, '')).toLocaleString() : ''} onChange={(e) => handleActualChange(row.yearNum || 0, e.target.value)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-playbookBlue">Your Wealth Trajectory</h3>
                <div className="flex items-center gap-4 bg-playbookBlue/5 px-3 py-2 rounded-lg border border-playbookBlue/10">
                    <span className="text-xs font-bold text-playbookBlue uppercase">Avg Return: {projectionData.avgRate.toFixed(1)}%</span>
                    <div className="flex items-center gap-1 no-print">
                        <input type="text" value={annualReturn} onChange={(e) => updateSetting('annualReturn', e.target.value)} className="w-12 bg-white border border-playbookGold/30 rounded text-xs text-center font-bold text-playbookBlue" />
                        <span className="text-xs text-playbookBlue/60">%</span>
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#003366" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.05}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Area type="monotone" dataKey="displayValue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorNw)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
      </div>

      {/* Navigation Button */}
      <div className="mt-12 flex justify-center no-print">
        <button 
          onClick={onNext}
          className="group bg-playbookGold text-playbookBlue px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-playbookGold/90 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 border border-playbookBlue/10"
        >
          Final Step: Review Actuals & Outlook
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default NetWorthForecast;