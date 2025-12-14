import React, { useState } from 'react';
import type { FinancialItem, AppSettings } from '../types';
import { generateFinancialAdvice } from '../services/geminiService';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  items: FinancialItem[];
  settings: AppSettings;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ items, settings }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateFinancialAdvice(items, settings);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Family Office AI</h3>
              <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {advice ? 'Regenerate Report' : 'Generate Report'}
          </button>
        </div>
      </div>
      
      <div className="p-6 flex-grow bg-slate-50/50 overflow-y-auto max-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium animate-pulse">Analyzing portfolio dynamics...</p>
          </div>
        ) : advice ? (
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-8">
            <Sparkles className="w-12 h-12 text-slate-200 mb-4" />
            <p className="font-medium text-slate-600 mb-1">Unlock Institutional Insights</p>
            <p className="text-sm">Click the button above to have the AI analyze your net worth, assets, and liabilities to provide actionable wealth management strategies.</p>
          </div>
        )}
      </div>
    </div>
  );
};