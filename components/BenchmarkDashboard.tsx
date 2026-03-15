'use client';

import { useState, useEffect } from 'react';
import { runBenchmark } from '@/lib/benchmarkService';
import PerformanceChart from './PerformanceChart';

interface BenchmarkResults {
  iterations: number;
  averages: {
    rsa: {
      keyGen: string;
      encrypt: string;
      decrypt: string;
      size: number;
    };
    pqc: {
      keyGen: string;
      encrypt: string;
      decrypt: string;
      size: number;
    };
  };
}

export default function BenchmarkDashboard() {
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDefaultBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const benchmarkResults = await runBenchmark("Standard Benchmark Payload");
      setResults(benchmarkResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDefaultBenchmark();
  }, []);

  const formatTime = (timeStr: string) => {
    return parseFloat(timeStr).toFixed(2) + ' ms';
  };

  const calculateSpeedup = (pqcTime: string, rsaTime: string) => {
    const pqc = parseFloat(pqcTime);
    const rsa = parseFloat(rsaTime);
    return (rsa / pqc).toFixed(1) + 'x';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Performance Overview
          </h2>
          <button
            onClick={runDefaultBenchmark}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Running...' : 'Refresh Benchmark'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Running benchmark...</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Generation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">RSA-2048:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.rsa.keyGen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">ML-KEM-768:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.pqc.keyGen)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                    <span className="text-sm">Speedup:</span>
                    <span className="font-mono text-sm">{calculateSpeedup(results.averages.pqc.keyGen, results.averages.rsa.keyGen)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Encryption/Encapsulation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">RSA-2048:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.rsa.encrypt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">ML-KEM-768:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.pqc.encrypt)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400">
                    <span className="text-sm">RSA Faster:</span>
                    <span className="font-mono text-sm">{calculateSpeedup(results.averages.rsa.encrypt, results.averages.pqc.encrypt)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Decryption/Decapsulation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">RSA-2048:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.rsa.decrypt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">ML-KEM-768:</span>
                    <span className="font-mono text-sm">{formatTime(results.averages.pqc.decrypt)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                    <span className="text-sm">Speedup:</span>
                    <span className="font-mono text-sm">{calculateSpeedup(results.averages.pqc.decrypt, results.averages.rsa.decrypt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Ciphertext Size Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.averages.rsa.size} B</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">RSA-2048</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{results.averages.pqc.size} B</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">ML-KEM-768</div>
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                ML-KEM is {(results.averages.pqc.size / results.averages.rsa.size).toFixed(1)}x larger
              </div>
            </div>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Based on {results.iterations} iterations per operation
            </div>
          </div>
        )}
      </div>

      {results && !loading && <PerformanceChart data={results} />}
    </div>
  );
}
