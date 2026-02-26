import crypto from 'crypto';

export function runRSABenchmark(inputData) {
  const metrics = {};

  // 1. Measure Key Generation
  const keyGenStart = performance.now();
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Standard RSA key size for benchmarking
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  const keyGenEnd = performance.now();
  metrics.keyGenerationTimeMs = keyGenEnd - keyGenStart;

  // 2. Measure Encryption
  const bufferData = Buffer.from(inputData, 'utf8');
  const encryptStart = performance.now();
  const encryptedData = crypto.publicEncrypt(publicKey, bufferData);
  const encryptEnd = performance.now();
  
  metrics.encryptionTimeMs = encryptEnd - encryptStart;
  metrics.ciphertextSizeBytes = encryptedData.length;

  // 3. Measure Decryption
  const decryptStart = performance.now();
  const decryptedData = crypto.privateDecrypt(privateKey, encryptedData);
  const decryptEnd = performance.now();
  
  metrics.decryptionTimeMs = decryptEnd - decryptStart;

  // Verify correctness silently
  if (decryptedData.toString('utf8') !== inputData) {
    throw new Error("RSA Decryption failed to match original input");
  }

  return metrics;
}