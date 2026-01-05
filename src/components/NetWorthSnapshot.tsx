import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { NetWorthItem } from '../types';
import { Plus, Pencil, Check, ArrowRight } from 'lucide-react';

interface NetWorthSnapshotProps {
  items: NetWorthItem[];
  setItems: (items: NetWorthItem[]) => void;
  isHidden: boolean;
  onNext?: () => void;
}

const NetWorthSnapshot: React.FC<NetWorthSnapshotProps> = ({ items, setItems, isHidden, onNext }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemType, setNewItemType] = useState<'asset' | 'liability'>('asset');
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '') {
        setter('');
        return;
    }
    if (!isNaN(Number(rawValue))) {
        setter(Number(rawValue).toLocaleString());
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

  const startEditing = (item: NetWorthItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditValue(item.value.toLocaleString());
  };

  const saveEdit = (id: string) => {
    const numericValue = parseFloat(editValue.replace(/,/g, ''));
    if (!editName || isNaN(numericValue)) {
      setEditingId(null);
      return;
    }

    setItems(items.map(item => 
      item.id === id ? { ...item, name: editName, value: numericValue } : item
    ));
    setEditingId(null);
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
    <div className="p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm no-print">
            <h3 className="font-bold text-[#001F3F] mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-[#D4AF37]"/> Add Asset or Liability</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input 
                type="text" 
                placeholder="Name" 
                className="px-3 py-2 border rounded-md text-sm w-full outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Value" 
                className="px-3 py-2 border rounded-md text-sm w-full outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={newItemValue}
                onChange={(e) => handleValueChange(e, setNewItemValue)}
              />
              <select 
                className="px-3 py-2 border rounded-md text-sm w-full outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as 'asset' | 'liability')}
              >
                <option value="asset">Asset (+)</option>
                <option value="liability">Liability (-)</option>
              </select>
            </div>
            <button 
              onClick={addItem}
              className="w-full bg-[#001F3F] text-[#D4AF37] py-2 rounded-md hover:bg-[#001F3F]/90 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
            >
              Update Statement
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-md shadow-sm">
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-2 mr-4">
                    <input 
                      type="text"
                      className="flex-1 px-2 py-1 border rounded text-sm outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <input 
                      type="text"
                      className="w-24 px-2 py-1 border rounded text-sm text-right outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      value={editValue}
                      onChange={(e) => handleValueChange(e, setEditValue)}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-[#001F3F]">{item.name}</div>
                    <div className={`text-[10px] uppercase tracking-widest font-bold ${item.type === 'asset' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  {editingId !== item.id && (
                    <span className="font-mono font-bold text-[#001F3F]">
                      {item.type === 'liability' && '-'}${item.value.toLocaleString()}
                    </span>
                  )}
                  <button 
                    onClick={() => editingId === item.id ? saveEdit(item.id) : startEditing(item)} 
                    className="text-slate-400 hover:text-[#D4AF37] no-print p-1 transition-colors"
                    title={editingId === item.id ? "Save" : "Edit"}
                  >
                    {editingId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Pencil className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
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
                  <Cell key="cell-asset" fill="#001F3F" />
                  <Cell key="cell-liability" fill="#D4AF37" />
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="flex justify-center border-t border-slate-200 pt-12 no-print">
        <button 
          onClick={onNext}
          className="group bg-[#D4AF37] text-[#001F3F] px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-[#D4AF37]/90 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 border border-[#001F3F]/10"
        >
          Next: Calculate Investment Capacity
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default NetWorthSnapshot;