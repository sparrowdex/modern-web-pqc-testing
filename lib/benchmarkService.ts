export interface BenchmarkResults {
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

export async function runBenchmark(payload: string): Promise<BenchmarkResults> {
  const response = await fetch('/api/benchmark', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    throw new Error(`Benchmark failed: ${response.statusText}`);
  }

  return response.json();
}
