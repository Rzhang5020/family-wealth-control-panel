import React from 'react';
import NetWorthCalculator from './components/NetWorthCalculator';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetWorthCalculator />
      </main>
    </div>
  );
}