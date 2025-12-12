import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'neutral' | 'positive' | 'negative';
  icon?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, icon }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getColor = () => {
    switch (type) {
      case 'positive': return 'text-emerald-600 bg-emerald-50';
      case 'negative': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(amount)}</h3>
        </div>
        <div className={`p-2 rounded-lg ${getColor()}`}>
          {icon || <DollarSign className="w-5 h-5" />}
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Updated just now
      </div>
    </div>
  );
};
