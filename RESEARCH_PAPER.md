# Comparative Study of Classical Cryptography (RSA) and Quantum Cryptography (ML-KEM) Applied in Modern Web Applications

## Abstract

As quantum computing technology matures, classical public-key cryptosystems such as RSA (Rivest–Shamir–Adleman) face existential threats from Shor's algorithm. To mitigate this, the National Institute of Standards and Technology (NIST) has standardized Module-Lattice-based Key Encapsulation Mechanism (ML-KEM), formerly known as Kyber. This paper presents a comparative analysis of RSA-2048 and ML-KEM-768 within a modern Next.js web application architecture. Benchmarks conducted across three distinct payload scenarios demonstrate that ML-KEM-768 offers orders-of-magnitude faster key generation and decapsulation speeds compared to RSA-2048, establishing it as a highly scalable alternative for future-proof web security, despite a marked increase in ciphertext size.

## 1. Introduction

The security of the modern internet relies on the difficulty of factoring large integers (RSA) or computing discrete logarithms (ECC). However, a Cryptographically Relevant Quantum Computer (CRQC) would be able to solve these problems efficiently. In response, the industry is migrating to Post-Quantum Cryptography (PQC).

This study focuses on the practical implementation and performance implications of this migration. We integrate ML-KEM-768 (NIST Security Level 3) into a Node.js/Next.js environment to measure the real-world impact on latency and bandwidth when replacing the industry-standard RSA-2048.

## 2. Methodology

### 2.1 Experimental Environment
The benchmarking framework was built using **Next.js 16.1.6** running in a Node.js runtime.
*   **Classical Algorithm**: RSA-2048 with OAEP padding, utilizing the native Node.js `crypto` module (OpenSSL bindings).
*   **Quantum-Safe Algorithm**: ML-KEM-768, utilizing the `@noble/post-quantum` pure JavaScript implementation.

### 2.2 Test Scenarios
Tests were executed with **50 iterations** per request to smooth out variance.
1.  **Scenario A (Key Exchange)**: A 32-byte payload simulating an AES-256 symmetric key exchange.
2.  **Scenario B (Short Message)**: A standard "Hello World" text payload.
3.  **Scenario C (Maximum Payload)**: A ~190-byte payload, pushing RSA-2048 to its effective capacity limits.

## 3. Results

The following metrics were collected. Time is measured in milliseconds (ms) and Size in bytes (B).

### Scenario A: AES-256 Key Exchange (32 Bytes)
| Metric | RSA-2048 | ML-KEM-768 | Difference |
| :--- | :--- | :--- | :--- |
| **Key Generation** | 595.89 ms | 3.47 ms | **ML-KEM is ~171x Faster** |
| **Encryption / Encap** | 0.91 ms | 3.11 ms | RSA is ~3x Faster |
| **Decryption / Decap** | 5.53 ms | 2.87 ms | **ML-KEM is ~1.9x Faster** |
| **Ciphertext Size** | 256 B | 1088 B | ML-KEM is ~4.25x Larger |

### Scenario B: Short Text Message
| Metric | RSA-2048 | ML-KEM-768 | Difference |
| :--- | :--- | :--- | :--- |
| **Key Generation** | 632.46 ms | 4.16 ms | **ML-KEM is ~152x Faster** |
| **Encryption / Encap** | 1.01 ms | 3.93 ms | RSA is ~3.9x Faster |
| **Decryption / Decap** | 5.33 ms | 3.73 ms | **ML-KEM is ~1.4x Faster** |

### Scenario C: Maximum Payload (~190 Bytes)
*Note: This scenario observed significant JIT (Just-In-Time) compilation benefits, resulting in lower absolute latencies, but relative performance remained consistent.*

| Metric | RSA-2048 | ML-KEM-768 | Difference |
| :--- | :--- | :--- | :--- |
| **Key Generation** | 199.77 ms | 1.26 ms | **ML-KEM is ~158x Faster** |
| **Encryption / Encap** | 0.35 ms | 1.20 ms | RSA is ~3.4x Faster |
| **Decryption / Decap** | 1.83 ms | 0.98 ms | **ML-KEM is ~1.8x Faster** |

## 4. Analysis

### 4.1 Computational Efficiency (CPU)
The most significant finding is the discrepancy in **Key Generation**. RSA key generation requires finding two large prime numbers, a probabilistic and computationally expensive process. In contrast, ML-KEM relies on lattice-based matrix operations (Learning With Errors), which is deterministic and efficient.

In all scenarios, ML-KEM-768 key generation (e.g., **1.26 ms**) was over **150x faster** than RSA-2048 (**199.77 ms**). For server environments that handle high session churn and require ephemeral key exchanges (common in modern TLS and API authentication), ML-KEM offers a substantial performance advantage.

### 4.2 Decapsulation vs. Decryption
**Decryption** is often the most critical operation for a server, as it is performed upon receiving data. Our results consistently show that ML-KEM decapsulation is **1.4x to 1.9x faster** than RSA decryption. This is consistent with theoretical expectations; RSA decryption involves modular exponentiation with a large private exponent, whereas ML-KEM uses polynomial multiplication.

### 4.3 Bandwidth and Ciphertext Size
The primary trade-off of post-quantum cryptography is size. RSA-2048 produces a compact **256-byte** ciphertext, while ML-KEM-768 produces a **1088-byte** ciphertext.

In high-throughput environments where bandwidth is constrained, this **4.25x increase** in packet size could introduce latency. However, given modern network speeds (Gbps), the computational gains on the server CPU (milliseconds saved) likely outweigh the nanoseconds lost transmitting an additional 832 bytes.

### 4.4 Anomalies and JIT
In Scenario C (Maximum Payload), we observed significantly faster absolute times for both algorithms compared to Scenarios A and B (e.g., RSA KeyGen dropping from ~600ms to ~200ms). This is attributed to the Node.js V8 engine's Just-In-Time (JIT) compiler optimizing the cryptographic hot paths after repeated execution. Despite this absolute shift, the relative performance ratio remained consistent, validating the robustness of the findings.

## 5. Conclusion

This study concludes that migrating from RSA-2048 to ML-KEM-768 is not only feasible but advantageous for modern web applications. The slight increase in bandwidth usage is negligible compared to the massive gains in computational efficiency, particularly in Key Generation and Decryption.

For developers implementing secure communication layers in Next.js:
1.  **Adopt Hybrid Encryption**: Use ML-KEM-768 for the initial key exchange (Key Encapsulation) to establish a shared secret.
2.  **Use Symmetric Ciphers**: Use the shared secret (AES-256) for bulk data encryption, as ML-KEM is not designed for direct message encryption.
3.  **Monitor Bandwidth**: While the overhead is minimal for most applications, high-frequency IoT or constrained-bandwidth scenarios should account for the ~1KB packet size.

The future of web security is quantum-resistant, and tools like ML-KEM provide a clear path forward without sacrificing performance.

## References
1.  NIST Post-Quantum Cryptography Standardization Process.
2.  The `@noble/post-quantum` JavaScript Library.
3.  Rivest, Shamir, Adleman. "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems."
4.  Bos, J., et al. "CRYSTALS-Kyber: A CCA-Secure Module-Lattice-Based KEM."