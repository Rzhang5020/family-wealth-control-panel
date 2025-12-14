import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { NetWorthItem } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface NetWorthSnapshotProps {
  items: NetWorthItem[];
  setItems: (items: NetWorthItem[]) => void;
  isHidden: boolean;
}

const NetWorthSnapshot: React.FC<NetWorthSnapshotProps> = ({ items, setItems, isHidden }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemType, setNewItemType] = useState<'asset' | 'liability'>('asset');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '') {
        setNewItemValue('');
        return;
    }
    if (!isNaN(Number(rawValue))) {
        setNewItemValue(Number(rawValue).toLocaleString());
    }
  };

  const addItem = () => {
    if (!newItemName || !newItemValue) return;
    const numericValue = parseFloat(newItemValue.replace(/,/g, ''));
    
    const newItem: NetWorthItem = {
      id: Date.now().toString(),
      name: newItemName,
      value: numericValue,
      type: newItemType
    };
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemValue('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const stats = useMemo(() => {
    const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, curr) => acc + curr.value, 0);
    return { totalAssets, totalLiabilities };
  }, [items]);

  const chartData = [
    { name: 'Total Assets', value: stats.totalAssets },
    { name: 'Total Liabilities', value: stats.totalLiabilities },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm no-print">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add Asset or Liability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input 
              type="text" 
              placeholder="Name (e.g. Rental Property)" 
              className="px-3 py-2 border rounded-md text-sm w-full"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Value" 
              className="px-3 py-2 border rounded-md text-sm w-full"
              value={newItemValue}
              onChange={handleValueChange}
            />
            <select 
              className="px-3 py-2 border rounded-md text-sm w-full"
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as 'asset' | 'liability')}
            >
              <option value="asset">Asset (+)</option>
              <option value="liability">Liability (-)</option>
            </select>
          </div>
          <button 
            onClick={addItem}
            className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            Update Statement
          </button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto print:max-h-none print:overflow-visible">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-md shadow-sm print:border-slate-300 print:shadow-none">
              <div>
                <div className="font-medium text-slate-800">{item.name}</div>
                <div className={`text-xs uppercase tracking-wider font-bold ${item.type === 'asset' ? 'text-green-600 print:text-black' : 'text-red-600 print:text-black'}`}>
                  {item.type}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-medium">
                  {item.type === 'liability' && '-'}${item.value.toLocaleString()}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 no-print">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6 border border-slate-200 shadow-sm print:shadow-none print:border-none">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                <Cell key="cell-asset" fill="#22c55e" />
                <Cell key="cell-liability" fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NetWorthSnapshot;