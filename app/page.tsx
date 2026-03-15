'use client';

import { useState, useRef, useEffect } from 'react';
import BenchmarkDashboard from '@/components/BenchmarkDashboard';
import TestingInterface from '@/components/TestingInterface';
import AnimatedLatticeBackground from '@/components/AnimatedLatticeBackground';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const contentRef = useRef(null);

  // Ready for your GSAP entrance animations
  useEffect(() => {
    // gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
  }, [activeTab]);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden text-slate-200">
      
      {/* 2D Canvas Background Layer - Fixed behind everything */}
      <AnimatedLatticeBackground />

      {/* Main UI Layer */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        
        <header className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            NIST Standardized
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-slate-100 to-slate-500 mb-4">
            Post-Quantum Cryptography
          </h1>
          <p className="text-xl text-slate-400 font-light">
            Benchmarking RSA-2048 against ML-KEM-768 in the browser.
          </p>
        </header>

        {/* Floating Tab Navigation */}
        <div className="flex justify-center mb-12 w-full">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-1.5 rounded-2xl shadow-2xl shadow-black/50 inline-flex relative">
            {['overview', 'testing', 'dashboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-xl transition-all duration-300 font-medium tracking-wide z-10 ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-linear-to-b from-blue-600 to-blue-800 rounded-xl shadow-lg -z-10" />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <main ref={contentRef} className="w-full max-w-5xl w-full">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Glassmorphic Hero Panel */}
              <section className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-10 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-opacity group-hover:opacity-70"></div>
                
                <h2 className="text-3xl font-semibold text-white mb-6 relative z-10">
                  The Quantum Threat Paradigm
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-3xl relative z-10">
                  As quantum computing matures, classical cryptosystems like <strong>RSA-2048</strong> face existential threats from Shor's algorithm. This environment provides a real-world, interactive benchmark comparing classical standards against <strong>ML-KEM-768</strong>.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 relative z-10">
                  {/* Metric Cards */}
                  {[
                    { label: 'Faster Key Gen', value: '~150x', sub: 'ML-KEM vs RSA', color: 'text-blue-400' },
                    { label: 'Faster Decapsulation', value: '1.4x - 1.9x', sub: 'Server workload', color: 'text-emerald-400' },
                    { label: 'Larger Ciphertext', value: '4.25x', sub: '1088B vs 256B', color: 'text-amber-400' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50 backdrop-blur-md">
                      <div className={`${stat.color} font-bold text-4xl mb-2 tracking-tighter`}>{stat.value}</div>
                      <div className="text-slate-200 font-medium">{stat.label}</div>
                      <div className="text-slate-500 text-sm mt-1">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Panels */}
              <section className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/50 shadow-xl flex flex-col justify-between hover:bg-slate-800/40 transition-colors duration-500">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Live Testing</h3>
                    <p className="text-slate-400 mb-8">
                      Run client-side benchmarking across 50 iterations. Analyze key exchange and payload performance in real-time.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('testing')}
                    className="w-full py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Initialize Environment
                  </button>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/50 shadow-xl flex flex-col justify-between hover:bg-slate-800/40 transition-colors duration-500">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Historical Analytics</h3>
                    <p className="text-slate-400 mb-8">
                      Review aggregated statistical data. Analyze CPU efficiency, bandwidth tradeoffs, and export raw CSV reports.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full py-4 bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    View Analytics
                  </button>
                </div>
              </section>
            </div>
          )}
          
          {/* Wrapped in a conditional so the glassmorphic box doesn't render empty on the Overview tab */}
          {(activeTab === 'dashboard' || activeTab === 'testing') && (
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl">
              {activeTab === 'dashboard' && <BenchmarkDashboard />}
              {activeTab === 'testing' && <TestingInterface />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}