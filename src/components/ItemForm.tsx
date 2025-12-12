import React, { useState } from 'react';
import { FinancialItem, AssetCategory, LiabilityCategory, ItemType } from '../types';
import { PlusCircle, X } from 'lucide-react';

interface ItemFormProps {
  onAdd: (item: FinancialItem) => void;
  onClose: () => void;
  type: ItemType;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onAdd, onClose, type }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [category, setCategory] = useState<string>(
    type === 'asset' ? AssetCategory.RealEstate : LiabilityCategory.Mortgage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newItem: FinancialItem = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      type,
      category: category as string,
      interestRate: parseFloat(rate) || 0,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Add New {type === 'asset' ? 'Asset' : 'Liability'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={type === 'asset' ? "e.g. Tesla Stock" : "e.g. Chase Credit Card"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value / Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                {type === 'asset' 
                  ? Object.values(AssetCategory).map((c: string) => <option key={c} value={c}>{c}</option>)
                  : Object.values(LiabilityCategory).map((c: string) => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {type === 'asset' ? 'Growth Rate (%)' : 'Interest Rate (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="0.0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-6"
          >
            <PlusCircle className="w-5 h-5" />
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};