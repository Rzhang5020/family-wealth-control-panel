import React from 'react';
import { RefreshCw, PieChart, Wallet, BarChart3, Activity } from 'lucide-react';

interface ControlPanelProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ activeTab, setActiveTab, onReset }) => {
  const tabs = [
    { id: 'snapshot', label: '1. Net Worth Snapshot', icon: <PieChart className="w-4 h-4" /> },
    { id: 'capacity', label: '2. Investment Capacity', icon: <Wallet className="w-4 h-4" /> },
    { id: 'dashboard', label: '3. Wealth Trajectory', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'outlook', label: '4. Actuals & Outlook', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#D4AF37] text-[#001F3F] p-6 shadow-lg no-print">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#001F3F]">
              Family Wealth Control Panel™
            </h1>
            <p className="text-[#001F3F]/80 text-sm font-medium mt-1">
              Clarity for real-life money decisions
            </p>
          </div>
          
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#001F3F]/30 hover:bg-[#001F3F]/10 transition-all text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            RESET DATA
          </button>
        </div>

        {/* Workflow Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 rounded-xl text-sm font-bold transition flex flex-col items-center justify-center text-center gap-2 shadow-sm border border-[#001F3F]/10 ${
                activeTab === tab.id 
                  ? 'bg-[#001F3F] text-[#D4AF37] shadow-xl' 
                  : 'bg-white/20 text-[#001F3F] hover:bg-white/30'
              }`}
            >
              {tab.icon}
              <span className="leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};