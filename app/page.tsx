'use client';

import { useState } from 'react';
import BenchmarkDashboard from '@/components/BenchmarkDashboard';
import TestingInterface from '@/components/TestingInterface';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Post-Quantum Cryptography Benchmark
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Compare RSA-2048 vs ML-KEM-768 Performance
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'testing'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Testing Interface
            </button>
          </div>
        </div>

        <main>
          {activeTab === 'dashboard' && <BenchmarkDashboard />}
          {activeTab === 'testing' && <TestingInterface />}
        </main>
      </div>
    </div>
  );
}
