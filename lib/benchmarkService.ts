export interface BenchmarkResults {
  iterations: number;
  averages: {
    rsa: { keyGen: string; encrypt: string; decrypt: string; size: number; };
    pqc: { keyGen: string; encrypt: string; decrypt: string; size: number; };
  };
}

export async function runBenchmark(
  payload: string, 
  onProgress?: (iteration: number, total: number) => void
): Promise<BenchmarkResults> {
  
  const response = await fetch('/api/benchmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Benchmark failed: ${response.statusText}`);
  }

  // Read the streaming chunks
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let finalResult: BenchmarkResults | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Split by newline because multiple chunks might arrive at once
    const chunks = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
    
    for (const chunk of chunks) {
      const parsed = JSON.parse(chunk);
      
      if (parsed.type === 'progress' && onProgress) {
        onProgress(parsed.iteration, parsed.total);
      } else if (parsed.type === 'complete') {
        finalResult = parsed.data;
      }
    }
  }

  if (!finalResult) throw new Error("Stream closed before completion");
  return finalResult;
}