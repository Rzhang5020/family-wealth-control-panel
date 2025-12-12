import React from 'react';
import type { AppSettings } from '../types';
import { Settings, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onUpdate, onReset }) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
        <Settings className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-lg">Control Panel</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Projection Period</label>
            <span className="text-sm font-bold text-blue-400">{settings.projectionYears} Years</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={settings.projectionYears}
            onChange={(e) => onUpdate({ ...settings, projectionYears: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Inflation Adjustment</label>
            <span className="text-sm font-bold text-blue-400">{settings.inflationRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={settings.inflationRate}
            onChange={(e) => onUpdate({ ...settings, inflationRate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-slate-500 mt-2">Adjusts future value for purchasing power parity.</p>
        </div>

        <button
            onClick={onReset}
            className="w-full mt-4 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition flex items-center justify-center gap-2 border border-slate-700"
        >
            <RefreshCw className="w-4 h-4" />
            Reset Defaults
        </button>
      </div>
    </div>
  );
};