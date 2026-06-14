# truehuman

[![CI](https://github.com/code-hemu/truehuman/actions/workflows/test.yml/badge.svg)](https://github.com/code-hemu/truehuman/actions/workflows/test.yml)

Bot detection and human verification library for web applications. Runs in-browser without external API calls or CAPTCHAs.

## Installation

```bash
npm install truehuman
```

## Usage

```ts
import { analyze } from "truehuman"

const result = await analyze()
// { human: false, score: 15, risk: "high", fingerprint: "...", signals: ["webdriver"] }
```

## API

### `analyze()` (main entry)

Runs all detectors, integrity checks, and fingerprinting, returning a `HumanResult`:

```ts
interface HumanResult {
  human: boolean       // true when score >= 50
  score: number        // 0-100 (higher = more human-like)
  risk: RiskLevel      // "low" | "medium" | "high"
  fingerprint: string  // SHA-256 hash of canvas + audio + WebGL fingerprints
  signals: SignalName[] // list of triggered detectors
}
```

### Individual Detectors

Each detector returns a `SignalResult`:

```ts
interface SignalResult {
  name: string
  detected: boolean
  suspicious: boolean
  weight: number
  riskDelta: number
  details?: Record<string, unknown>
}
```

| Function | What it detects |
|---|---|
| `detectWebDriver()` | `navigator.webdriver`, `$cdc_`/`$chrome_async` props |
| `detectHeadless()` | Missing `chrome`/`plugins`, headless `userAgent`, disabled `languages` |
| `detectIframe()` | Nested `window.top !== window.self` |
| `detectWebGL()` | WebGL renderer mismatch, missing `WEBGL_debug_renderer_info` |
| `detectCanvas()` | Canvas fingerprint variance via `toDataURL` |
| `detectScreen()` | Screen dimensions, color depth, neural net analysis |
| `detectPerformance()` | Navigation timing, memory, paint timing anomalies |
| `detectEnvironment()` | Direct `.html` file open (empty referrer + search) |
| `detectStorage()` | localStorage load frequency (72h TTL, max 5 loads) |
| `detectCssUa()` | CSS `supports()` UA mismatch (Chrome/Firefox cross-check) |

### Integrity Checks

```ts
import { runIntegrityChecks } from "truehuman"

const result = runIntegrityChecks()
// { checks: [...], detected: true, score: 10 }
```

Checks instance-level property descriptors across 6 domains:

| Function | Checks |
|---|---|
| `checkDocumentIntegrity()` | `document.hidden`, `hasFocus` descriptors |
| `checkNavigatorIntegrity()` | `navigator.vendor`, `platform`, `userAgent` descriptors |
| `checkScreenIntegrity()` | `screen.width`, `height`, `orientation` descriptors |
| `checkDateIntegrity()` | `Date.prototype.toString`, `getTimezoneOffset` |
| `checkIframeElementIntegrity()` | `HTMLIFrameElement.prototype.src`, `srcdoc` |
| `checkPrototypeIntegrity()` | Canvas/WebGL/Audio prototype method native-ness |

### Fingerprinting

```ts
import { fingerprintCanvas, fingerprintAudio, fingerprintWebGL, sha256 } from "truehuman"

const fp = [fingerprintCanvas(), fingerprintAudio(), fingerprintWebGL()]
const hash = await sha256(fp.filter(Boolean).join("|"))
```

### Scoring

```ts
import { calculateRisk, calculateConfidence } from "truehuman"

calculateRisk(signals)          // { score: 85, risk: "low" }
calculateConfidence(signals, score) // 0-100 confidence percentage
```

## Testing

```bash
# Unit tests (jsdom, 15 files, 57 tests)
npm test

# Browser tests (Playwright Chromium, 3 files, 14 tests)
npm run test:browser

# All tests
npm run test:all
```

## Build

```bash
npm run build          # Rollup → CJS, ESM, UMD + type declarations
```

Outputs to `dist/` as CommonJS, ESM, and UMD bundles with `.d.ts` types.

## CI

Push/PR to `main` triggers GitHub Actions with parallel unit + browser (Playwright) test jobs.
