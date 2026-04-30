'use client';

import { BenchmarkResults } from '@/lib/benchmarkService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toPng } from 'html-to-image';

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

  // Use Math.max(..., 0.001) to prevent log(0) errors if a value rounds to exactly 0
  const performanceData = [
    { operation: 'Key Gen', 'RSA-2048': Math.max(rsaKeyGen, 0.001), 'ML-KEM-768': Math.max(pqcKeyGen, 0.001) },
    { operation: 'Encrypt', 'RSA-2048': Math.max(rsaEncrypt, 0.001), 'ML-KEM-768': Math.max(pqcEncrypt, 0.001) },
    { operation: 'Decrypt', 'RSA-2048': Math.max(rsaDecrypt, 0.001), 'ML-KEM-768': Math.max(pqcDecrypt, 0.001) },
  ];

  const maxTime = Math.max(rsaKeyGen, rsaEncrypt, rsaDecrypt, pqcKeyGen, pqcEncrypt, pqcDecrypt);
  const radarData = [
    { metric: 'Key Generation', RSA: (rsaKeyGen / maxTime) * 100, 'ML-KEM': (pqcKeyGen / maxTime) * 100, fullMark: 100 },
    { metric: 'Encryption', RSA: (rsaEncrypt / maxTime) * 100, 'ML-KEM': (pqcEncrypt / maxTime) * 100, fullMark: 100 },
    { metric: 'Decryption', RSA: (rsaDecrypt / maxTime) * 100, 'ML-KEM': (pqcDecrypt / maxTime) * 100, fullMark: 100 },
  ];

  const sizeData = [
    { algorithm: 'RSA-2048', size: data.averages.rsa.size },
    { algorithm: 'ML-KEM-768', size: data.averages.pqc.size },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    borderColor: 'rgba(51, 65, 85, 0.5)', 
    borderRadius: '0.75rem',
    color: '#f8fafc', 
  };

  const exportToPNG = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Filter out the download button itself from the final image
    const filter = (node: HTMLElement) => {
      return !(node.tagName === 'BUTTON' && node.title === 'Download Chart as PNG');
    };

    // Temporarily reveal hidden elements and apply light-mode styles for the capture
    const hiddenElements = element.querySelectorAll<HTMLElement>('.hidden.print\\:block');
    hiddenElements.forEach(el => { el.style.display = 'block'; });
    element.classList.add('force-export-light-mode');

    try {
      const dataUrl = await toPng(element, {
        filter: filter,
        pixelRatio: 2, // Generates a high-resolution image
        backgroundColor: 'rgba(0,0,0,0)', // This overrides the white background from the helper class
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    } finally {
      // IMPORTANT: Always clean up the temporary styles to restore the UI
      hiddenElements.forEach(el => { el.style.display = ''; });
      element.classList.remove('force-export-light-mode');
    }
  };

  return (
    <div className="space-y-6 print:space-y-12 print:bg-white w-full max-w-5xl mx-auto print:max-w-full print:w-full print:mx-0">
      {/* Bar Chart - Performance Comparison */}
      <div id="chart-performance" className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-6 backdrop-blur-sm print:border-none print:shadow-none print:p-0 break-inside-avoid relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 print:text-black mb-2">
              Performance Comparison (milliseconds)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 print:text-slate-700 italic">
              Note: The Y-axis uses a logarithmic scale to properly visualize ML-KEM's microscopic execution times alongside RSA.
            </p>
          </div>
          <button onClick={() => exportToPNG('chart-performance', 'performance-comparison.png')} className="print:hidden p-2 text-slate-500 hover:text-blue-500 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all" title="Download Chart as PNG">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
        <ResponsiveContainer width="99%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="operation" />
            <YAxis scale="log" domain={[0.01, 'auto']} allowDataOverflow tickFormatter={(val) => val < 1 ? val.toFixed(2) : val.toFixed(0)} />
            <Tooltip
              // FIXED: Added 'name' so it labels the data correctly
              formatter={(value, name) => [`${parseFloat(value as string).toFixed(2)} ms`, name]}
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#f8fafc' }}
              // FIXED: Replaced white background with a subtle highlight
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="RSA-2048" fill="#3B82F6" isAnimationActive={false} />
            <Bar dataKey="ML-KEM-768" fill="#A855F7" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Relative Performance */}
      <div id="chart-relative" className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-6 backdrop-blur-sm print:border-none print:shadow-none print:p-0 break-inside-avoid relative">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 print:text-black">
            Relative Performance Analysis
          </h3>
          <button onClick={() => exportToPNG('chart-relative', 'relative-performance.png')} className="print:hidden p-2 text-slate-500 hover:text-blue-500 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all" title="Download Chart as PNG">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
        <ResponsiveContainer width="99%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="RSA-2048" dataKey="RSA" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} isAnimationActive={false} />
            <Radar name="ML-KEM-768" dataKey="ML-KEM" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} isAnimationActive={false} />
            <Tooltip 
              formatter={(value, name) => [`${parseFloat(value as string).toFixed(1)}% (normalized)`, name]}
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {/* Explicit Data Table for PDF/Print Viewing */}
        <div className="hidden print:block mt-6">
          <p className="text-sm font-bold text-black mb-2">Relative Performance Results (Normalized %):</p>
          <table className="w-full border-collapse border border-slate-300 text-sm text-black">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-left">Metric</th>
                <th className="border border-slate-300 p-2 text-right">RSA-2048</th>
                <th className="border border-slate-300 p-2 text-right">ML-KEM-768</th>
              </tr>
            </thead>
            <tbody>
              {radarData.map((row) => (
                <tr key={row.metric}>
                  <td className="border border-slate-300 p-2 font-medium">{row.metric}</td>
                  <td className="border border-slate-300 p-2 text-right">{row.RSA.toFixed(1)}%</td>
                  <td className="border border-slate-300 p-2 text-right">{row['ML-KEM'].toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Size Comparison */}
      <div id="chart-size" className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-6 backdrop-blur-sm print:border-none print:shadow-none print:p-0 break-inside-avoid relative">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 print:text-black">
            Ciphertext Size Comparison (bytes)
          </h3>
          <button onClick={() => exportToPNG('chart-size', 'ciphertext-size.png')} className="print:hidden p-2 text-slate-500 hover:text-blue-500 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all" title="Download Chart as PNG">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
        <ResponsiveContainer width="99%" height={250}>
          <BarChart data={sizeData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="algorithm" type="category" width={100} />
            <Tooltip
              formatter={(value, name) => [`${value} bytes`, name === 'size' ? 'Size' : name]}
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />
            <Bar dataKey="size" fill="#10B981" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Added Explicit Insights for PDF / Print */}
        <div className="mt-6 text-sm text-slate-600 dark:text-slate-400 print:text-black bg-slate-50 dark:bg-slate-800/50 print:bg-transparent p-4 rounded-lg print:p-0">
          <p className="mb-2"><strong>Why measure Ciphertext?</strong> While ML-KEM is computationally much faster, its resulting ciphertext is <strong>{(data.averages.pqc.size / data.averages.rsa.size).toFixed(1)}x larger</strong> than RSA.</p>
          <p>In modern web applications, sending larger key encapsulation payloads over the network increases bandwidth consumption and can introduce latency on slow connections. This chart highlights the primary trade-off of Post-Quantum Cryptography: <em>CPU Speed vs. Network Overhead.</em></p>
        </div>
      </div>
    </div>
  );
}