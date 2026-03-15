'use client';

import { useState } from 'react';
import { runBenchmark, BenchmarkResults } from '@/lib/benchmarkService';
import PerformanceChart from './PerformanceChart';

const PRESET_PAYLOADS = [
  { name: 'AES-256 Key Exchange', value: 'a'.repeat(32), description: '32-byte symmetric key' },
  { name: 'Short Message', value: 'Hello World!', description: 'Standard text message' },
  { name: 'Maximum Payload', value: 'a'.repeat(190), description: '~190 bytes (RSA limit)' },
];

export default function TestingInterface() {
  const [customPayload, setCustomPayload] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PAYLOADS[0].value);
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustom, setUseCustom] = useState(false);

  const runTest = async () => {
    const payload = useCustom ? customPayload : selectedPreset;
    
    if (!payload || payload.trim() === '') {
      setError('Please enter a payload or select a preset');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const benchmarkResults = await runBenchmark(payload);
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

  const calculateSpeedup = (pqcTime: string, rsaTime: string) => {
    const pqc = parseFloat(pqcTime);
    const rsa = parseFloat(rsaTime);
    return (rsa / pqc).toFixed(1) + 'x';
  };

  const getPayloadSize = () => {
    const payload = useCustom ? customPayload : selectedPreset;
    return new Blob([payload]).size;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Interactive Testing Interface
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payload Selection
            </label>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useCustom}
                  onChange={() => setUseCustom(false)}
                  className="mr-2"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Presets</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="mr-2"
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
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors font-medium"
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

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Running 50 iterations for accurate results...
              </p>
            </div>
          )}
        </div>
      </div>

      {results && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Benchmark Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
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
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                    <span>Speedup:</span>
                    <span>{calculateSpeedup(results.averages.pqc.keyGen, results.averages.rsa.keyGen)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
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
                  <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400">
                    <span>RSA Faster:</span>
                    <span>{calculateSpeedup(results.averages.rsa.encrypt, results.averages.pqc.encrypt)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
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
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                    <span>Speedup:</span>
                    <span>{calculateSpeedup(results.averages.pqc.decrypt, results.averages.rsa.decrypt)}</span>
                  </div>
                </div>
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
  );
}
