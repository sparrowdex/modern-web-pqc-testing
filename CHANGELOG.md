# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Interactive Testing Interface**: A comprehensive benchmarking tool to compare classical RSA-2048 against post-quantum ML-KEM-768.
- **Real-Time Data Streaming**: Implemented a Node.js streaming API to broadcast live progress updates and yield to the event loop.
- **Dynamic Visualizations**: Integrated Recharts for detailed performance analytics, utilizing a logarithmic scale to accurately display ML-KEM's microscopic execution times alongside RSA.
- **Export Capabilities**:
  - **Save as PDF**: Utilizes CSS `@media print` rules to strip away UI elements and backgrounds, generating clean, academic-quality reports.
  - **Export CSV**: Allows downloading of raw benchmark metric averages for external analysis.
  - **Download as PNG**: Individual charts can be exported as high-res, transparent PNGs.
- **Custom Branding**: Added a responsive `lattice-logo.svg` and a `MovingTitle` component for a smooth scrolling "news ticker" effect in the browser tab.
- **JIT Warmup Phase**: Added an unrecorded 5-iteration warmup loop to the backend to ensure the V8 engine optimizes the cryptographic math before recording timings.

### Changed
- Consolidated the redundant `BenchmarkDashboard` directly into the `TestingInterface` to create a unified "Report Generator" experience.
- Replaced `html2canvas` with `html-to-image` to support modern CSS color spaces (like `lab()` and `oklch()`) introduced in Tailwind CSS v4.
- Disabled Recharts animations (`isAnimationActive={false}`) during print and export events to guarantee graphs are fully rendered the exact moment a snapshot is taken.
- Set maximum iteration limit to 5000 in the API route to prevent accidental Vercel/Node server timeouts.

### Fixed
- Fixed an issue where the backend was ignoring the frontend's iteration slider by properly parsing the `iterations` parameter from the request body.
- Fixed a bug where chart PNG exports were rendering completely blank in dark mode. Solved by injecting a `.force-export-light-mode` CSS class to briefly swap SVG fill/stroke colors strictly during the capture phase.
- Fixed severe layout shifting and page overflow during PDF generation by removing hardcoded container limits (`print:max-w-full`) to adhere to standard A4 paper dimensions.
- Fixed a known Recharts bug where SVG graphs would stretch out of bounds during `window.print()` events by constraining `ResponsiveContainer` widths to `99%`.

### Security
- Upgraded `next` and `eslint-config-next` from `16.1.6` to `16.2.3` to resolve several high-severity vulnerabilities flagged by `npm audit`, including:
  - HTTP request smuggling in rewrites (GHSA-ggv3-7p47-pfv8).
  - Unbounded next/image disk cache growth (GHSA-3x4c-7xq6-9pq8).
  - Denial of Service via unbounded postponed resume buffering (GHSA-h27x-g6w4-24gq).
  - CSRF check bypass vulnerabilities.

## [0.1.0] - Initial Release

### Added
- **Project Foundation**: Bootstrapped Next.js 16 application with Tailwind CSS v4 and TypeScript.
- **Cryptographic Modules**: 
  - Integrated native Node.js `crypto` module for RSA-2048 operations.
  - Integrated `@noble/post-quantum` library for Post-Quantum ML-KEM-768 operations.
- **API Route**: Created `/api/benchmark` endpoint to execute comparative timing tests.
- **3D & 2D Backgrounds**: Added a 3D `LatticeVisualization` using React Three Fiber and a 2D `AnimatedLatticeBackground` for the main UI.
- **Benchmark Dashboard**: Built initial static dashboard (`BenchmarkDashboard.tsx`) to display basic payload sizes and CPU timing comparisons.
- **Research Context**: Included `RESEARCH_PAPER.md` outlining the theoretical foundation and purpose of the comparative study.

---
*Document generated for RSA vs ML-KEM Research Project.*