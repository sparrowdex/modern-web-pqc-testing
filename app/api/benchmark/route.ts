import { NextRequest, NextResponse } from 'next/server';
import { runRSABenchmark } from '@/lib/crypto/rsa';
import { runMLKEMBenchmark } from '@/lib/crypto/mlkem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = body.payload || "Standard Benchmark Payload";
    
    // Safely parse iterations, fallback to 50, and cap at 5000 to prevent server timeouts
    const requestedIterations = parseInt(body.iterations, 10) || 50;
    const iterations = Math.min(Math.max(requestedIterations, 10), 5000);

    const encoder = new TextEncoder();

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const results = {
          rsa: { keyGen: [] as number[], enc: [] as number[], dec: [] as number[] },
          pqc: { keyGen: [] as number[], enc: [] as number[], dec: [] as number[] }
        };

        // WARMUP PHASE (Unrecorded):
        // Run crypto algorithms silently 5 times so the V8 JS engine 
        // JIT compiler can optimize the code paths before we start timing.
        for (let w = 0; w < 5; w++) {
          runRSABenchmark(payload);
          await runMLKEMBenchmark(payload);
        }

        for (let i = 0; i < iterations; i++) {
          // 1. Yield to the event loop so the server can actually send the chunk
          await new Promise(resolve => setTimeout(resolve, 5));

          // 2. Broadcast the live progress to the frontend
          const progressChunk = JSON.stringify({ type: 'progress', iteration: i + 1, total: iterations });
          controller.enqueue(encoder.encode(progressChunk + '\n'));

          // 3. Run the heavy crypto math
          const rsa = runRSABenchmark(payload);
          results.rsa.keyGen.push(rsa.keyGenerationTimeMs);
          results.rsa.enc.push(rsa.encryptionTimeMs);
          results.rsa.dec.push(rsa.decryptionTimeMs);

          const pqc = await runMLKEMBenchmark(payload);
          results.pqc.keyGen.push(pqc.keyGenerationTimeMs);
          results.pqc.enc.push(pqc.encryptionTimeMs);
          results.pqc.dec.push(pqc.decryptionTimeMs);
        }

        // 4. Calculate final averages
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const finalData = {
          iterations,
          averages: {
            rsa: {
              keyGen: avg(results.rsa.keyGen).toFixed(4),
              encrypt: avg(results.rsa.enc).toFixed(4),
              decrypt: avg(results.rsa.dec).toFixed(4),
              size: 256
            },
            pqc: {
              keyGen: avg(results.pqc.keyGen).toFixed(4),
              encrypt: avg(results.pqc.enc).toFixed(4),
              decrypt: avg(results.pqc.dec).toFixed(4),
              size: 1088
            }
          }
        };

        // 5. Broadcast the final benchmark results and close the stream
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'complete', data: finalData }) + '\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}