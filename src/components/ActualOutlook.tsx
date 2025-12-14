import React, { useMemo, useState } from 'react';
import type { ForecastSettings, ActualRecord } from '../types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

interface ActualOutlookProps {
  startingNetWorth: number;
  settings: ForecastSettings;
  actuals: ActualRecord[];
  onUpdateActual: (record: ActualRecord) => void;
  isHidden: boolean;
}

const ActualOutlook: React.FC<ActualOutlookProps> = ({
  startingNetWorth,
  settings,
  actuals,
  onUpdateActual,
}) => {
  const [showLifeStage, setShowLifeStage] = useState(true);

  // 1. Prepare Data Maps for O(1) Access
  const actualsMap = useMemo(() => {
    return actuals.reduce((acc, curr) => {
      acc[curr.yearIndex] = curr;
      return acc;
    }, {} as Record<number, ActualRecord>);
  }, [actuals]);

  // 2. Generate System Data (Initial Projection vs Actual vs Rebased)
  const systemData = useMemo(() => {
    const data = [];
    
    // Assumptions
    const p1 = settings.phase1Monthly === '' ? 0 : settings.phase1Monthly;
    const p2 = settings.phase2Monthly === '' ? 0 : settings.phase2Monthly;
    const p3 = settings.phase3Monthly === '' ? 0 : settings.phase3Monthly;
    const globalRate = settings.annualReturn === '' ? 0 : settings.annualReturn;
    const { startYear, customStages, customReturns } = settings;

    let baselineBalance = startingNetWorth;
    
    // Push Time Zero
    data.push({
      year: 'Start',
      calendarYear: startYear - 1,
      yearIndex: 0,
      baseline: startingNetWorth,
      actual: startingNetWorth,
      rebased: startingNetWorth,
      actualVsBaseline: 1.0,
      rebasedVsBaseline: 1.0, // Initialize to 1.0 (100%)
      lifeStage: 'Start',
      capacity: 0,
      capacityTooltip: '',
      actualGrowth: null as number | null,
      returnRate: 0
    });

    for (let year = 1; year <= 15; year++) {
      // --- Determine Stage & Contribution ---
      let phase: 1 | 2 | 3 = 1;
      if (customStages[year]) {
          phase = customStages[year];
      } else {
          if (year <= 3) phase = 1;
          else if (year <= 8) phase = 2;
          else phase = 3;
      }

      // --- Determine Rate for this year ---
      let currentRate = globalRate;
      if (customReturns[year] !== undefined) {
        currentRate = customReturns[year];
      }
      const decimalRate = currentRate / 100;


      let monthlyContrib = 0;
      let stageName = '';
      if (phase === 1) { monthlyContrib = p1; stageName = 'Foundation'; }
      else if (phase === 2) { monthlyContrib = p2; stageName = 'Discipline'; }
      else { monthlyContrib = p3; stageName = 'Velocity'; }

      const annualContrib = monthlyContrib * 12;
      
      // --- Baseline (Initial Projection) Calculation ---
      // Formula: EOY = BOY * (1 + r) + AnnualContribution * (1 + r/2)
      const newBaseline = (baselineBalance * (1 + decimalRate)) + (annualContrib * (1 + decimalRate / 2));

      // --- Actuals Lookup ---
      const record = actualsMap[year];
      const hasActual = record && record.eoyBalance !== '';
      const actualEOY = hasActual ? (record.eoyBalance as number) : null;
      
      // --- Determine Capacity & Tooltip ---
      let capacityVal = 0;
      let capacityTooltip = '';

      if (hasActual) {
          // If actuals exist, prioritize the manual input for "Total Annual Invested" (Table A)
          capacityVal = record.totalAnnual === '' ? 0 : record.totalAnnual;
          capacityTooltip = 'Source: Actual (User Input)';
      } else {
          // Fallback to the projected annual contribution from settings
          capacityVal = annualContrib;
          capacityTooltip = `Source: Milestone Tracker ($${monthlyContrib.toLocaleString()}/mo)`;
      }

      // --- Actual Growth Calc ---
      let calculatedGrowthPct = null;
      // SKIP YEAR 1: User requested first year growth calc be hidden.
      if (hasActual && year > 1) {
        // BOY for Actual calc
        let boyActual = startingNetWorth;
        if (year > 1) {
           const prevRecord = actualsMap[year - 1];
           if (prevRecord && prevRecord.eoyBalance !== '') {
             boyActual = prevRecord.eoyBalance as number;
           } else {
             // If gap in data, use Rebased EOY of prev year as proxy for BOY
             boyActual = data[year - 1].rebased; 
           }
        }

        const totalInvActual = (record.totalAnnual === '' ? 0 : record.totalAnnual);
        // Formula: (EOY - BOY - Inv) / (BOY + Inv/2)
        const numerator = actualEOY! - boyActual - totalInvActual;
        const denominator = boyActual + (totalInvActual / 2);
        
        if (denominator !== 0) {
            calculatedGrowthPct = (numerator / denominator) * 100;
        }
      }

      // --- Rebased Calculation ---
      // If Actual exists, Rebased snaps to Actual.
      // If no Actual, Rebased projects from PRIOR YEAR Rebased using assumptions.
      let newRebased = 0;
      
      if (hasActual) {
        newRebased = actualEOY!;
      } else {
        const prevRebased = data[year - 1].rebased; // Puts us on the new path
        // Formula: PrevRebased * (1 + r) + AnnualContribution * (1 + r/2)
        newRebased = (prevRebased * (1 + decimalRate)) + (annualContrib * (1 + decimalRate / 2));
      }

      data.push({
        year: `Yr ${year}`,
        calendarYear: startYear + (year - 1),
        yearIndex: year,
        baseline: Math.round(newBaseline),
        actual: actualEOY, // Can be null
        rebased: Math.round(newRebased),
        actualVsBaseline: actualEOY ? (actualEOY / newBaseline) : null,
        rebasedVsBaseline: newRebased / newBaseline,
        lifeStage: stageName,
        capacity: capacityVal, 
        capacityTooltip: capacityTooltip,
        actualGrowth: calculatedGrowthPct,
        returnRate: currentRate
      });

      // Advance running totals
      baselineBalance = newBaseline;
    }

    return data;
  }, [startingNetWorth, settings, actualsMap]);

  // 3. Helper for Inputs
  const handleInputChange = (yearIndex: number, field: keyof ActualRecord, val: string) => {
    const raw = val.replace(/,/g, '');
    const numVal = raw === '' ? '' : parseFloat(raw);
    
    // Find existing or create new
    const existing = actuals.find(a => a.yearIndex === yearIndex);
    const notes = existing?.notes || '';
    const totalAnnual = existing?.totalAnnual ?? '';
    const eoyBalance = existing?.eoyBalance ?? '';

    const newRecord: ActualRecord = {
      yearIndex,
      totalAnnual,
      eoyBalance,
      notes,
      [field]: field === 'notes' ? val : numVal
    };

    onUpdateActual(newRecord);
  };

  const getLastActual = () => {
    const sorted = [...actuals].filter(a => a.eoyBalance !== '').sort((a,b) => b.yearIndex - a.yearIndex);
    return sorted.length > 0 ? sorted[0] : null;
  };

  const lastActual = getLastActual();
  const lastStatusRow = lastActual ? systemData.find(d => d.yearIndex === lastActual.yearIndex) : null;
  const year15Data = systemData[15];
  const rebasedDiffPct = ((year15Data.rebased - year15Data.baseline) / year15Data.baseline) * 100;

  // IMPORTANT: We remove the 'return null' check to ensure this component is ALWAYS in the DOM.
  // Visibility is handled by the parent's CSS (display: none vs block).

  return (
    <div className="p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300 space-y-8">
      
      {/* HEADER STATUS */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-stretch">
        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
            <h3 className="font-bold text-slate-800 mb-2">Year-End Update</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-slate-500">Last Year Completed</div>
                    <div className="font-medium text-slate-900">{lastActual ? `${systemData[lastActual.yearIndex].calendarYear}` : 'None'}</div>
                </div>
                <div>
                    <div className="text-slate-500">Status</div>
                    {lastStatusRow && lastStatusRow.actualVsBaseline ? (
                        <div className={`font-bold flex items-center gap-1 ${lastStatusRow.actualVsBaseline >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {lastStatusRow.actualVsBaseline >= 1 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                            {lastStatusRow.actualVsBaseline >= 1 ? 'Ahead of Plan' : 'Behind Plan'}
                        </div>
                    ) : (
                        <div className="text-slate-400 italic">Pending Data</div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex-1 bg-slate-900 p-6 rounded-xl text-white shadow-sm flex flex-col justify-center print:bg-white print:border print:border-slate-300 print:text-slate-900 print:shadow-none">
             <div className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-2 border-b border-slate-700 pb-2 print:border-slate-300">Rebased Outlook (Yr 15)</div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-xs text-slate-400 mb-1">Rebased Value</div>
                    <div className="text-2xl font-serif font-bold text-emerald-400 print:text-emerald-700">
                        ${year15Data.rebased.toLocaleString()}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Initial Projection</div>
                    <div className="text-xl font-medium text-slate-300 print:text-slate-600">
                        ${year15Data.baseline.toLocaleString()}
                    </div>
                 </div>
             </div>
             <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-slate-800 print:border-slate-300">
                <span className="text-slate-400">Variance:</span>
                <span className={`font-bold ${rebasedDiffPct >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                    {rebasedDiffPct > 0 ? '+' : ''}{rebasedDiffPct.toFixed(1)}%
                </span>
             </div>
        </div>
      </div>

      {/* TABLE A: ANNUAL RECORD */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm print:shadow-none print:border-slate-300">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:bg-slate-100">
            <div className="font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Your Annual Record
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Total Annual Invested (Actual)</th>
                        <th className="px-4 py-3">EOY Balance (Actual)</th>
                        <th className="px-4 py-3 bg-slate-50">Time-Weighted Return</th>
                        <th className="px-4 py-3">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    {systemData.slice(1).map((row) => {
                       const record = actualsMap[row.yearIndex] || { totalAnnual: '', eoyBalance: '', notes: '' };
                       return (
                        <tr key={row.yearIndex} className="hover:bg-slate-50 print:bg-white">
                            <td className="px-4 py-2 font-medium text-slate-900 w-24">{row.calendarYear}</td>
                            
                            {/* Total Annual Input */}
                            <td className="px-4 py-2">
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-slate-400 text-xs no-print">$</span>
                                    <input 
                                        type="text"
                                        className="w-full pl-5 pr-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none print:border-none print:pl-0 print:text-right"
                                        placeholder="0"
                                        value={record.totalAnnual === '' ? '' : record.totalAnnual.toLocaleString()}
                                        onChange={(e) => handleInputChange(row.yearIndex, 'totalAnnual', e.target.value)}
                                    />
                                </div>
                            </td>

                            {/* EOY Balance Input */}
                            <td className="px-4 py-2">
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-slate-400 text-xs no-print">$</span>
                                    <input 
                                        type="text"
                                        className="w-full pl-5 pr-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold text-slate-700 print:border-none print:pl-0 print:text-right"
                                        placeholder="-"
                                        value={record.eoyBalance === '' ? '' : record.eoyBalance.toLocaleString()}
                                        onChange={(e) => handleInputChange(row.yearIndex, 'eoyBalance', e.target.value)}
                                    />
                                </div>
                            </td>

                            {/* Growth % Calc */}
                            <td className="px-4 py-2 bg-slate-50/50 text-slate-600 print:bg-white">
                                {row.actualGrowth !== null ? (
                                    <span className={row.actualGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {row.actualGrowth.toFixed(1)}%
                                    </span>
                                ) : '-'}
                            </td>

                            {/* Notes */}
                            <td className="px-4 py-2">
                                <input 
                                    type="text"
                                    className="w-full bg-transparent border-b border-transparent focus:border-slate-300 outline-none text-xs text-slate-600 print:border-none"
                                    placeholder="Add notes..."
                                    value={record.notes}
                                    onChange={(e) => handleInputChange(row.yearIndex, 'notes', e.target.value)}
                                />
                            </td>
                        </tr>
                       );
                    })}
                </tbody>
            </table>
        </div>
    </div>

    {/* TABLE B: DATA FLOW */}
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:bg-slate-100">
             <div className="font-bold text-slate-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                Reality-adjusted Path
            </div>
            <button 
                onClick={() => setShowLifeStage(!showLifeStage)}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 no-print"
            >
                {showLifeStage ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                {showLifeStage ? 'Hide Stage' : 'Show Stage'}
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-500 uppercase">
                    <tr>
                        <th className="px-4 py-3">Year</th>
                        {showLifeStage && <th className="px-4 py-3">Life Stage</th>}
                        <th className="px-4 py-3 text-right">Ann. Inv (Act)</th>
                        <th className="px-4 py-3 text-right text-slate-500">Annual Return</th>
                        <th className="px-4 py-3 text-right">Initial Projection</th>
                        <th className="px-4 py-3 text-right">Actual EOY</th>
                        <th className="px-4 py-3 text-center">Act vs Ini. Proj.</th>
                        <th className="px-4 py-3 text-right text-emerald-700 font-bold">Rebased EOY</th>
                        <th className="px-4 py-3 text-center">Rebased vs Ini. Proj.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                     {systemData.slice(1).map((row) => (
                        <tr key={row.yearIndex} className="hover:bg-slate-50 text-slate-600 print:bg-white">
                             <td className="px-4 py-2 font-medium">{row.calendarYear}</td>
                             {showLifeStage && (
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider 
                                        ${row.lifeStage === 'Foundation' ? 'bg-blue-100 text-blue-700 print:text-blue-900 print:bg-transparent' : 
                                        row.lifeStage === 'Discipline' ? 'bg-orange-100 text-orange-700 print:text-orange-900 print:bg-transparent' : 
                                        'bg-purple-100 text-purple-700 print:text-purple-900 print:bg-transparent'}`}>
                                        {row.lifeStage}
                                    </span>
                                </td>
                             )}
                             <td 
                                className="px-4 py-2 text-right cursor-help border-b border-transparent hover:border-slate-300 transition-colors"
                                title={row.capacityTooltip}
                                onClick={() => alert(row.capacityTooltip)}
                             >
                                <span className={row.capacityTooltip.includes('User Input') ? 'border-b border-dotted border-slate-400' : ''}>
                                    ${row.capacity.toLocaleString()}
                                </span>
                             </td>
                             <td className="px-4 py-2 text-right text-slate-500 bg-slate-50/50">{row.returnRate}%</td>
                             <td className="px-4 py-2 text-right">${row.baseline.toLocaleString()}</td>
                             <td className="px-4 py-2 text-right font-bold text-slate-900">
                                {row.actual ? `$${row.actual.toLocaleString()}` : '-'}
                             </td>
                             <td className="px-4 py-2 text-center">
                                {row.actualVsBaseline ? `${(row.actualVsBaseline * 100).toFixed(0)}%` : '-'}
                             </td>
                             <td className="px-4 py-2 text-right font-bold text-emerald-700 bg-emerald-50/30 print:bg-transparent print:text-black">
                                ${row.rebased.toLocaleString()}
                             </td>
                             <td className="px-4 py-2 text-center">
                                <span className={(row.rebasedVsBaseline ?? 0) >= 1 ? 'text-emerald-600 print:text-black' : 'text-amber-600 print:text-black'}>
                                    {((row.rebasedVsBaseline ?? 0) * 100).toFixed(0)}%
                                </span>
                             </td>
                        </tr>
                     ))}
                </tbody>
            </table>
        </div>
    </div>

    {/* CHART C */}
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600"/> 
            Three-Line Trajectory
        </h3>
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="calendarYear" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                        formatter={(value: number, name: string) => {
                            if (value === null) return ['-', name];
                            return [`$${value.toLocaleString()}`, name];
                        }}
                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend />
                    {/* Baseline */}
                    <Line 
                        type="monotone" 
                        dataKey="baseline" 
                        name="Initial Projection" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false}
                    />
                    {/* Rebased (Future Path) */}
                    <Line 
                        type="monotone" 
                        dataKey="rebased" 
                        name="Reality Adjusted Path" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        strokeDasharray="3 3"
                        dot={false}
                    />
                    {/* Actual (Solid) */}
                    <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual" 
                        stroke="#059669" 
                        strokeWidth={3} 
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>

    </div>
  );
};

export default ActualOutlook;