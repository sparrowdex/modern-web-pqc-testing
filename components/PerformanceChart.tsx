'use client';

import { BenchmarkResults } from '@/lib/benchmarkService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PerformanceChartProps {
  data: BenchmarkResults;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const rsaKeyGen = parseFloat(data.averages.rsa.keyGen);
  const rsaEncrypt = parseFloat(data.averages.rsa.encrypt);
  const rsaDecrypt = parseFloat(data.averages.rsa.decrypt);
  
  const pqcKeyGen = parseFloat(data.averages.pqc.keyGen);
  const pqcEncrypt = parseFloat(data.averages.pqc.encrypt);
  const pqcDecrypt = parseFloat(data.averages.pqc.decrypt);

  // Data for bar chart
  const performanceData = [
    {
      operation: 'Key Generation',
      'RSA-2048': rsaKeyGen,
      'ML-KEM-768': pqcKeyGen,
    },
    {
      operation: 'Encryption',
      'RSA-2048': rsaEncrypt,
      'ML-KEM-768': pqcEncrypt,
    },
    {
      operation: 'Decryption',
      'RSA-2048': rsaDecrypt,
      'ML-KEM-768': pqcDecrypt,
    },
  ];

  // Data for radar chart (normalized performance)
  const maxTime = Math.max(rsaKeyGen, rsaEncrypt, rsaDecrypt, pqcKeyGen, pqcEncrypt, pqcDecrypt);
  const radarData = [
    {
      metric: 'Key Generation',
      RSA: (rsaKeyGen / maxTime) * 100,
      'ML-KEM': (pqcKeyGen / maxTime) * 100,
      fullMark: 100,
    },
    {
      metric: 'Encryption',
      RSA: (rsaEncrypt / maxTime) * 100,
      'ML-KEM': (pqcEncrypt / maxTime) * 100,
      fullMark: 100,
    },
    {
      metric: 'Decryption',
      RSA: (rsaDecrypt / maxTime) * 100,
      'ML-KEM': (pqcDecrypt / maxTime) * 100,
      fullMark: 100,
    },
  ];

  // Size comparison data
  const sizeData = [
    {
      algorithm: 'RSA-2048',
      size: data.averages.rsa.size,
    },
    {
      algorithm: 'ML-KEM-768',
      size: data.averages.pqc.size,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bar Chart - Performance Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Performance Comparison (milliseconds)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="operation" />
            <YAxis />
            <Tooltip formatter={(value) => [`${parseFloat(value as string).toFixed(2)} ms`, '']} />
            <Legend />
            <Bar dataKey="RSA-2048" fill="#3B82F6" />
            <Bar dataKey="ML-KEM-768" fill="#A855F7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Relative Performance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Relative Performance Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="RSA-2048" dataKey="RSA" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Radar name="ML-KEM-768" dataKey="ML-KEM" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Size Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Ciphertext Size Comparison (bytes)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sizeData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="algorithm" type="category" />
            <Tooltip formatter={(value) => [`${value} bytes`, '']} />
            <Bar dataKey="size" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
          ML-KEM ciphertext is {(data.averages.pqc.size / data.averages.rsa.size).toFixed(1)}x larger
        </div>
      </div>
    </div>
  );
}
