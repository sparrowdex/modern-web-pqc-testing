# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-13
### Added
- **Benchmarking API**: Created `app/api/benchmark/route.js` to orchestrate side-by-side performance tests of RSA vs. ML-KEM.
- **Research Paper**: Added `RESEARCH_PAPER.md` containing the abstract, methodology, and empirical results comparing computational efficiency and artifact sizes.
- **Dependencies**: Integrated `@noble/post-quantum` package for NIST-standardized ML-KEM implementation.

### Changed
- **Benchmark Logic**: Implemented three specific test scenarios (AES-256 Key Exchange, Short Message, Max Payload) to measure Key Gen, Encapsulation, and Decapsulation times.
- **ML-KEM Module**: Updated `lib/crypto/mlkem.js` to correctly handle imports and perform standard Key Encapsulation Mechanisms.

## [0.1.0] - 2026-02-27
### Added
- **RSA Module (`lib/crypto/rsa.js`)**:
  - Implemented RSA-2048 using the Node.js native `crypto` library.
  - Added functionality for Key Pair generation, Public Key Encryption (OAEP), and Private Key Decryption.
- **ML-KEM Module (`lib/crypto/mlkem.js`)**:
  - Implemented ML-KEM-768 (Kyber) using the `@noble/post-quantum` library.
  - Added functionality for Lattice-based Key Generation, Encapsulation (Shared Secret generation), and Decapsulation.
- **Project Initialization**: Set up the Next.js framework to support the comparative study of classical vs. post-quantum cryptography.