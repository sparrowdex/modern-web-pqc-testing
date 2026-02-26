import { NextResponse } from 'next/server';
import { runRSABenchmark } from '@/lib/crypto/rsa';

export async function POST(request) {
  try {
    // Parse the incoming request for the text payload
    const body = await request.json();
    const payload = body.payload || "Default test string for cryptography benchmark.";

    // Run the RSA baseline
    const rsaMetrics = runRSABenchmark(payload);

    // TODO: Teammate 2 will eventually plug in the ML-KEM function here.
    // const pqcMetrics = runMLKEMBenchmark(payload);

    // Return the formatted metrics
    return NextResponse.json({
      success: true,
      payloadSize: Buffer.byteLength(payload, 'utf8'),
      results: {
        rsa: rsaMetrics,
        // pqc: pqcMetrics (coming soon)
      }
    });

  } catch (error) {
    console.error("Benchmark Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}