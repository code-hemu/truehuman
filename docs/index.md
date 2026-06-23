# truehuman

A lightweight, privacy-respecting browser fingerprinting and anti-bot detection library that runs entirely in the client environment. `truehuman` analyzes dozens of passive browser signals to determine whether a visitor is a real human, a suspicious agent, or an automated bot - all without sending any raw fingerprint data to external servers unless you explicitly opt in to a verification plugin.


## Overview

Modern web applications face a growing challenge distinguishing genuine human visitors from automated scripts, headless browsers, and malicious bots. `truehuman` addresses this by collecting and analyzing a wide range of passive browser signals - characteristics that real browsers expose naturally during normal operation, but that bots and emulated environments frequently get wrong, omit, or fabricate inconsistently.

The entire detection pipeline runs client-side in a single synchronous pass, requiring no backend infrastructure and no third-party API calls by default. When stricter server-side verification is needed, optional plugins for Google reCAPTCHA v3 and Cloudflare Turnstile can be layered on top of the core score.


## Features

### 20+ Passive Detectors

`truehuman` evaluates over twenty distinct browser characteristics without triggering any visible user interaction. Detection signals include:

- **Canvas fingerprinting** - renders hidden canvas elements and inspects pixel-level output to detect inconsistencies introduced by headless browsers or GPU emulation
- **WebGL probing** - queries the WebGL renderer and vendor strings, checks for software rasterizer signatures, and validates shader behavior
- **Font enumeration** - tests for the presence and rendering metrics of a broad range of system fonts, which vary predictably across real operating systems
- **Audio context analysis** - processes a small audio buffer and measures the output signature, which differs between real and emulated audio stacks
- **Screen and viewport signals** - examines screen resolution, device pixel ratio, color depth, and the relationship between window and screen dimensions
- **Navigator properties** - inspects `navigator.userAgent`, `navigator.platform`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, plugin lists, and language settings for internal consistency
- **Timing and performance** - measures microtask scheduling behavior, `requestAnimationFrame` cadence, and other timing patterns that diverge in automated contexts
- **DOM and CSS environment** - checks for the presence of expected browser APIs, CSS feature support, and subtle rendering differences across real versus emulated environments

Each detector contributes a weighted signal to the final risk score. No single signal is treated as conclusive on its own.

### Plugin System

For applications requiring server-side token verification, `truehuman` includes a first-class plugin interface. Built-in plugins are available for:

- **Google reCAPTCHA v3** - silently requests a reCAPTCHA token in the background and attaches it to the result object for backend validation
- **Cloudflare Turnstile** - integrates Turnstile's challenge flow and appends the resulting token to the `truehuman` result

Plugins are opt-in and do not affect the core client-side score. They are designed to complement, not replace, the passive detector pipeline.

### Risk Scoring

Every call to `truehuman` produces a structured result containing:

- **Score** - an integer from `0` to `100`, where `0` represents a confident human and `100` represents a near-certain bot
- **Verdict** - a human-readable classification: `"human"`, `"suspicious"`, or `"bot"`, derived from configurable score thresholds
- **Confidence** - a normalized measure of how many detectors produced usable signals, reflecting how reliable the score is for the current browser environment

Score thresholds and verdict labels are configurable, allowing you to tune sensitivity for your specific use case.

### No Dependencies

The `truehuman` core has zero third-party runtime dependencies. The compiled bundle weighs approximately **10 KB gzipped**, making it suitable for inclusion in performance-sensitive pages without meaningful impact on load time or Core Web Vitals.

### Universal Module Support

`truehuman` ships in three module formats to ensure compatibility across all JavaScript environments:

- **ESM** - for modern bundlers (Vite, Rollup, esbuild, Webpack 5)
- **CJS** - for Node.js environments and older bundler setups
- **UMD** - for direct `<script>` tag inclusion in browsers without a build step


## Quick Links

| Resource | Description |
| | |
| [Getting Started](getting-started.md) | Installation, setup, and your first detection call |
| [API Reference](api/analyze.md) | Full documentation for `analyze()` and all configuration options |
| [Plugins](plugins/recaptcha.md) | How to configure reCAPTCHA v3 and Cloudflare Turnstile plugins |
| [Scoring](scoring.md) | How the risk score is calculated and how to tune thresholds |
| [Error Codes](error-codes.md) | Reference for all error codes returned by the library |