'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { runBenchmark, BenchmarkResults } from '@/lib/benchmarkService';
import PerformanceChart from './PerformanceChart';
import LatticeVisualization from './LatticeVisualization'; 

const PRESET_PAYLOADS = [
  { name: 'AES-256 Key Exchange', value: 'a'.repeat(32), description: '32-byte symmetric key' },
  { name: 'Short Message', value: 'Hello World!', description: 'Standard text message' },
  { name: 'Maximum Payload', value: 'a'.repeat(190), description: '~190 bytes (RSA limit)' },
];

export default function TestingInterface() {
  // Required to safely use Portals in Next.js without SSR hydration errors
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [customPayload, setCustomPayload] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PAYLOADS[0].value);
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [iterations, setIterations] = useState(50);
  
  // State to track live progress from the benchmark stream
  const [progress, setProgress] = useState(0);
  const [progressStats, setProgressStats] = useState({ current: 0, total: 0 });

  const runTest = async () => {
    const payload = useCustom ? customPayload : selectedPreset;
    
    if (!payload || payload.trim() === '') {
      setError('Please enter a payload or select a preset');
      return;
    }

    setLoading(true);
    setProgress(0); // Reset progress at start
    setProgressStats({ current: 0, total: 0 });
    setError(null);
    
    try {
      // Pass a callback to runBenchmark to receive live updates
      const benchmarkResults = await runBenchmark(payload, iterations, (current, total) => {
        setProgress(current / total); // Math yields a float between 0.0 and 1.0
        setProgressStats({ current, total });
      });
      setResults(benchmarkResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    return parseFloat(timeStr).toFixed(2) + ' ms';
  };

  // Renamed arguments to be logically agnostic based on what is being compared
  const calculateSpeedup = (slowerTime: string, fasterTime: string) => {
    const slower = parseFloat(slowerTime);
    const faster = parseFloat(fasterTime);
    return (slower / faster).toFixed(1) + 'x';
  };

  const getPayloadSize = () => {
    const payload = useCustom ? customPayload : selectedPreset;
    return new Blob([payload]).size;
  };

  // CSV Export for Data Insights
  const exportToCSV = () => {
    if (!results) return;
    
    const payloadSize = getPayloadSize();
    const date = new Date().toISOString().split('T')[0];

    const csvContent = [
      "Metadata,Value",
      `Test Date,${date}`,
      `Iterations,${results.iterations}`,
      `Payload Size (Bytes),${payloadSize}`,
      "",
      "Metric,RSA-2048,ML-KEM-768,Unit",
      `Key Generation,${results.averages.rsa.keyGen},${results.averages.pqc.keyGen},ms`,
      `Encryption/Encapsulation,${results.averages.rsa.encrypt},${results.averages.pqc.encrypt},ms`,
      `Decryption/Decapsulation,${results.averages.rsa.decrypt},${results.averages.pqc.decrypt},ms`,
      `Ciphertext Size,${results.averages.rsa.size},${results.averages.pqc.size},bytes`
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quantum_benchmark_${results.iterations}_iters.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* MAIN UI - Wrapped in relative positioning so it sits behind the overlay */}
      <div className="space-y-6 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 print:hidden">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Interactive Testing Interface
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payload Selection
              </label>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!useCustom}
                    onChange={() => setUseCustom(false)}
                    className="mr-2 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Presets</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={useCustom}
                    onChange={() => setUseCustom(true)}
                    className="mr-2 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Custom</span>
                </label>
              </div>

              {!useCustom ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESET_PAYLOADS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset.value)}
                      className={`p-3 text-left rounded-lg border-2 transition-colors ${
                        selectedPreset === preset.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {preset.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    placeholder="Enter custom payload text..."
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    rows={4}
                  />
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Size: {getPayloadSize()} bytes
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Test Iterations: <span className="font-mono text-blue-500">{iterations}</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="5000" 
                  step="10"
                  value={iterations} 
                  onChange={(e) => setIterations(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-1">Higher values provide more accurate statistical averages but take longer to compute.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={runTest}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors font-medium relative z-20"
              >
                {loading ? 'Running Benchmark...' : 'Run Benchmark'}
              </button>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Payload size: {getPayloadSize()} bytes
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {results && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            {/* Added print: styling to make PDF export look cleaner */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 print:shadow-none print:border-none print:p-0">
              
              {/* NEW: Print-only Document Header */}
              <div className="hidden print:block mb-8 border-b border-slate-300 pb-6">
                <h1 className="text-3xl font-bold text-black mb-2">Quantum Cryptography Benchmark Report</h1>
                <p className="text-slate-600 mb-4">Comparative Analysis: RSA-2048 vs ML-KEM-768</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-black">
                  <div><strong>Test Iterations:</strong> {results.iterations} per algorithm</div>
                  <div><strong>Payload Size:</strong> {getPayloadSize()} bytes</div>
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 print:hidden">
                  Benchmark Results
                </h3>
                {/* Action Buttons for Exporting */}
                <div className="flex space-x-3 print:hidden">
                  <button onClick={exportToCSV} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md text-sm font-medium transition-colors">
                    Export CSV
                  </button>
                  <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                    Save as PDF
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg print:border print:border-slate-300 print:bg-none">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Generation</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>RSA:</span>
                      <span className="font-mono">{formatTime(results.averages.rsa.keyGen)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ML-KEM:</span>
                      <span className="font-mono">{formatTime(results.averages.pqc.keyGen)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 dark:text-green-400 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span>Speedup:</span>
                      <span>{calculateSpeedup(results.averages.rsa.keyGen, results.averages.pqc.keyGen)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg print:border print:border-slate-300 print:bg-none">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Encryption</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>RSA:</span>
                      <span className="font-mono">{formatTime(results.averages.rsa.encrypt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ML-KEM:</span>
                      <span className="font-mono">{formatTime(results.averages.pqc.encrypt)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                      <span>RSA Faster:</span>
                      <span>{calculateSpeedup(results.averages.pqc.encrypt, results.averages.rsa.encrypt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg print:border print:border-slate-300 print:bg-none">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Decryption</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>RSA:</span>
                      <span className="font-mono">{formatTime(results.averages.rsa.decrypt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ML-KEM:</span>
                      <span className="font-mono">{formatTime(results.averages.pqc.decrypt)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 dark:text-green-400 mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                      <span>Speedup:</span>
                      <span>{calculateSpeedup(results.averages.rsa.decrypt, results.averages.pqc.decrypt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Network Trade-off Report merged from the old Dashboard */}
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mt-6 print:bg-transparent print:border-slate-300">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Ciphertext Size & Network Trade-off</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.averages.rsa.size} B</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">RSA-2048</div>
                    <div className="text-xs text-slate-500 mt-1 italic">Baseline Payload</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{results.averages.pqc.size} B</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">ML-KEM-768</div>
                    <div className="text-xs text-rose-500 mt-1 italic font-medium">+{(results.averages.pqc.size - results.averages.rsa.size)} Bytes Overhead</div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded text-sm text-slate-700 dark:text-slate-300 text-center shadow-sm">
                  While ML-KEM is computationally much faster, its ciphertext is <strong>{(results.averages.pqc.size / results.averages.rsa.size).toFixed(1)}x larger</strong>. On high-latency networks (like 3G or constrained IoT devices), this added network payload can negate the speed benefits gained by the faster CPU execution.
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                Based on {results.iterations} iterations per operation
              </div>
            </div>

            <PerformanceChart data={results} />
          </div>
        )}
      </div>

      {/* FULL SCREEN ETHEREAL OVERLAY with PORTAL */}
      {loading && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          
          {/* Full Screen 3D Canvas with Live Progress Data */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LatticeVisualization progress={progress} />
          </div>

          {/* Floating Loading Text Panel with Live Progress Bar */}
          <div className="relative z-10 text-center bg-slate-900/70 p-8 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-xl max-w-lg mt-48 w-full mx-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
            <h3 className="text-xl font-bold text-slate-50 mb-3">
              Processing Cryptographic Operations
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Calculating noise polynomials and decapsulating LWE matrices...
            </p>
            
            {/* Live Progress UI */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-2 transition-all duration-75 ease-linear" 
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-slate-400 text-xs font-mono">
              <span>{Math.round(progress * 100)}%</span>
              <span>Iteration {progressStats.current} / {progressStats.total || '...'}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}