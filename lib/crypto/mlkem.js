// Add .js to the import path for v0.5.4
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

export async function runMLKEMBenchmark(inputData) {
  const metrics = {};
  
  // 1. Key Generation
  const keyGenStart = performance.now();
  // v0.5.4 uses .keygen()
  const aliceKeys = ml_kem768.keygen(); 
  const keyGenEnd = performance.now();
  metrics.keyGenerationTimeMs = keyGenEnd - keyGenStart;

  // 2. Encapsulation
  const encapStart = performance.now();
  const { cipherText, sharedSecret: bobSharedSecret } = ml_kem768.encapsulate(aliceKeys.publicKey);
  const encapEnd = performance.now();
  metrics.encryptionTimeMs = encapEnd - encapStart;
  metrics.ciphertextSizeBytes = cipherText.length;

  // 3. Decapsulation
  const decapStart = performance.now();
  const aliceSharedSecret = ml_kem768.decapsulate(cipherText, aliceKeys.secretKey);
  const decapEnd = performance.now();
  metrics.decryptionTimeMs = decapEnd - decapStart;

  return metrics;
}