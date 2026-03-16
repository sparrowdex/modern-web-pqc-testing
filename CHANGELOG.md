# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-03-16
### Added
- **3D Visualization Preparation**: Installed `three`, `@react-three/fiber`, `@react-three/drei`, and `@types/three` dependencies to prepare for a future 3D LWE lattice visualization component (independent of the global 2D animated lattice background).

### Fixed
- **PerformanceChart UI**: Fixed the Recharts tooltip overlay to use a custom dark theme matching the site design, resolving the issue where the default white background obscured readability.

## [0.3.0] - 2026-03-15
### Added
- **Animated Background**: Created `components/AnimatedLatticeBackground.tsx` to display an interactive 2D canvas particle lattice visualization, giving the landing page a quantum-themed aesthetic.
- **Legacy Backup**: Moved the original simple landing page layout to `app/backup/page.tsx` for safekeeping.

### Changed
- **Landing Page UI (`app/page.tsx`)**: Completely redesigned with a modern glassmorphism style. Added an "Overview" default tab that summarizes the `RESEARCH_PAPER.md` metrics and uses clear calls to action.
- **Dashboard Behavior (`components/BenchmarkDashboard.tsx`)**: Removed the `useEffect` hook that automatically ran the heavy cryptographic benchmark on page load. Implemented a clear empty state prompting the user to manually execute the test.
- **Testing Interface (`components/TestingInterface.tsx`)**: Upgraded to allow toggling between preset and custom text payloads. Added a robust loading state with a placeholder for a future 3D LWE lattice visualization.


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