import { NextResponse } from 'next/server';
import { runRSABenchmark } from '@/lib/crypto/rsa';
import { runMLKEMBenchmark } from '@/lib/crypto/mlkem';

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = body.payload || "Standard Benchmark Payload";
    const iterations = 50; // Run 50 times for academic accuracy

    const results = {
      rsa: { keyGen: [], enc: [], dec: [] },
      pqc: { keyGen: [], enc: [], dec: [] }
    };

    // Run the loop
    for (let i = 0; i < iterations; i++) {
      const rsa = runRSABenchmark(payload);
      results.rsa.keyGen.push(rsa.keyGenerationTimeMs);
      results.rsa.enc.push(rsa.encryptionTimeMs);
      results.rsa.dec.push(rsa.decryptionTimeMs);

      const pqc = await runMLKEMBenchmark(payload);
      results.pqc.keyGen.push(pqc.keyGenerationTimeMs);
      results.pqc.enc.push(pqc.encryptionTimeMs);
      results.pqc.dec.push(pqc.decryptionTimeMs);
    }

    // Helper to calculate average
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return NextResponse.json({
      iterations,
      averages: {
        rsa: {
          keyGen: avg(results.rsa.keyGen).toFixed(4),
          encrypt: avg(results.rsa.enc).toFixed(4),
          decrypt: avg(results.rsa.dec).toFixed(4)
        },
        pqc: {
          keyGen: avg(results.pqc.keyGen).toFixed(4),
          encrypt: avg(results.pqc.enc).toFixed(4),
          decrypt: avg(results.pqc.dec).toFixed(4)
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}