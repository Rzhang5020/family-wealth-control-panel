import React from 'react';
import { FinancialItem, ItemType } from '../types';
import { Trash2, TrendingUp, TrendingDown, Briefcase, Home, CreditCard, Wallet, Landmark, DollarSign, PieChart } from 'lucide-react';

interface FinancialListProps {
  items: FinancialItem[];
  type: ItemType;
  onRemove: (id: string) => void;
}

const getIcon = (category: string) => {
  if (category.includes('Real Estate')) return <Home className="w-4 h-4" />;
  if (category.includes('Stocks')) return <TrendingUp className="w-4 h-4" />;
  if (category.includes('Business')) return <Briefcase className="w-4 h-4" />;
  if (category.includes('Credit')) return <CreditCard className="w-4 h-4" />;
  if (category.includes('Mortgage')) return <Landmark className="w-4 h-4" />;
  if (category.includes('Cash')) return <Wallet className="w-4 h-4" />;
  return <PieChart className="w-4 h-4" />;
};

export const FinancialList: React.FC<FinancialListProps> = ({ items, type, onRemove }) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No {type === 'asset' ? 'assets' : 'liabilities'} added yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 capitalize">
          {type === 'asset' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
          {type === 'asset' ? 'Assets' : 'Liabilities'}
        </h3>
        <span className={`font-bold ${type === 'asset' ? 'text-emerald-700' : 'text-rose-700'}`}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${type === 'asset' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {getIcon(item.category)}
              </div>
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{item.category}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{item.interestRate}% {type === 'asset' ? 'Growth' : 'APR'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}
              </span>
              <button 
                onClick={() => onRemove(item.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
