# truehuman

Bot detection library for web applications. Runs entirely in-browser — no external API calls, no CAPTCHAs, no server-side validation required.

## Features

- **Zero dependencies** — pure TypeScript, no runtime libraries
- **Serverless** — all analysis happens in the visitor's browser
- **Real-time** — synchronous, completes in <10ms
- **Multi-layer** — 6 detectors covering automation, integrity, fingerprinting, and behavioral analysis
- **Privacy-first** — no data leaves the browser, no cookies, no tracking

## Installation

```bash
npm install truehuman
```

## Quick Start

```ts
import { analyze } from "truehuman"

const result = analyze()

if (result.verdict === "bot") {
  // block, flag, or rate-limit
}

console.log(result.confidence) // 0–100
```

### Script tag (UMD)

```html
<script src="dist/truehuman.min.js"></script>
<script>
  const result = truehuman.analyze()
  if (result.verdict === "bot") {
    console.log("Automated access detected")
  }
</script>
```

## API

### `analyze(mode?)`

Synchronous. Takes one optional argument and returns an `AnalyzeResult`.

| Mode | Returns `checks` as | Best for |
|---|---|---|
| `"public"` (default) | `{ passed, suspicious, failed }` counts | API consumers, pass/fail decisions |
| `"detailed"` | `CheckResult[]` with per-category evidence | Dashboards, audit logs |
| `"debug"` | Same as detailed + `debug` field with raw internals | Development, troubleshooting |

### Output example — public mode (empty browser)

```json
{
  "verdict": "human",
  "human": true,
  "direct": false,
  "riskScore": 0,
  "riskLevel": "low",
  "confidence": 100,
  "checks": {
    "passed": 5,
    "suspicious": 0,
    "failed": 0
  }
}
```

### Output example — detailed mode (automation detected)

```json
{
  "verdict": "bot",
  "human": false,
  "direct": false,
  "riskScore": 65,
  "riskLevel": "high",
  "confidence": 35,
  "checks": [
    {
      "name": "automation",
      "status": "fail",
      "riskDelta": 60,
      "evidence": [
        {
          "detector": "webdriver",
          "message": "navigator.webdriver is enabled",
          "code": 41
        },
        {
          "detector": "devtools",
          "message": "DevTools tab count mismatch detected",
          "code": "42.4"
        }
      ]
    },
    {
      "name": "browser_integrity",
      "status": "pass",
      "riskDelta": 0,
      "evidence": []
    },
    {
      "name": "iframe_integrity",
      "status": "pass",
      "riskDelta": 0,
      "evidence": []
    },
    {
      "name": "fingerprinting",
      "status": "pass",
      "riskDelta": 0,
      "evidence": []
    },
    {
      "name": "behavioral",
      "status": "pass",
      "riskDelta": 0,
      "evidence": []
    }
  ]
}
```

### Output example — debug mode

Adds a `debug` field:

```json
{
  "verdict": "human",
  "human": true,
  "direct": false,
  "riskScore": 5,
  "riskLevel": "low",
  "confidence": 95,
  "checks": [ ... ],
  "debug": {
    "integrityCodes": ["60.1"],
    "iframeComparisons": 6,
    "environmentFlag": null,
    "errors": []
  }
}
```

### Full type reference

```ts
interface AnalyzeResult {
  verdict: "human" | "suspicious" | "bot"
  human: boolean
  direct: boolean          // true = .html file opened directly from disk
  riskScore: number        // 0–100
  riskLevel: "low" | "medium" | "high" | "critical"
  confidence: number       // 0–100 (100 - riskScore)
  checks: CheckResult[] | { passed: number; suspicious: number; failed: number }
  debug?: DebugInfo
}

interface CheckResult {
  name: CheckCategory       // "automation" | "browser_integrity" | "iframe_integrity" | "fingerprinting" | "behavioral"
  status: CheckStatus       // "pass" | "suspicious" | "fail"
  riskDelta: number
  evidence: CheckEvidence[]
}

interface CheckEvidence {
  detector: string          // internal module name (e.g. "webdriver", "canvas", "user-agent")
  message: string           // human-readable description
  code: number | string     // signal code (e.g. 41, "60.1", "35.3.4")
}

interface DebugInfo {
  integrityCodes: (string | number)[]   // all raw signal codes
  iframeComparisons: number              // total iframe-vs-parent checks performed
  environmentFlag: boolean | null        // legacy flag (direct open OR NN score)
  errors: number[]                       // block-level error codes
}
```

## Detectors

All detectors run automatically inside `analyze()`. Each produces signal codes with associated risk deltas.

### Automation (`detectors/webdriver.ts`)

Detects Selenium, Playwright, Puppeteer, and browser automation tools.

| Code | Signal | Risk Delta |
|---|---|---|
| 41 | `navigator.webdriver` is enabled | 35 |
| 42.1 | `chrome.app` runtime detected | 5 |
| 42.2 | postMessage-based Function.toString override | 40 |
| 42.3 | Function.prototype.toString override | 40 |
| 42.4 | DevTools tab count mismatch (132/133 delta) | 15 |
| 43.2 | Window inner/outer/height equal (headless) | 25 |
| 43.4 | Screen <350px (headless) | 20 |
| 43.5.x | Invalid screen dimensions / orientation | 20 |
| 44.2–44.3 | Non-Chrome browser inconsistency | 15 |
| 44.4 | Fullscreen API without fullscreen state | 10 |
| 46 | `nods` attribute on document element | 20 |

### Browser Integrity (`detectors/headless.ts`)

Detects headless browser indicators and property descriptor tampering across 6 DOM domains.

| Code range | What it checks | Risk Delta |
|---|---|---|
| 10.1–10.4 | User-agent patterns (WebView, headless, CSS-UA mismatch) | 15–20 |
| 11.1–11.9 | Missing essential DOM APIs | 10 each |
| 20.1–20.2 | Performance navigation timing anomalies | 25 each |
| 30.1.x–30.4.x | `document.hidden`, `hasFocus` descriptors | 5–15 |
| 31.1.x–31.4.x | `navigator.vendor`, `platform`, `languages`, `webdriver`, `permissions`, `getUserMedia` descriptors | 5–15 |
| 33.1.x–33.4.x | `Date.prototype.toString`, `getTimezoneOffset` descriptors | 5–15 |
| 60.1–60.3 | localStorage frequency (2h TTL), disabled, error | 3–8 |

### Iframe Integrity (`detectors/iframe.ts`)

Checks iframe element property integrity and cross-context comparisons.

| Code | Signal | Risk Delta |
|---|---|---|
| 34.1.x–34.4.x | `iframe.src`, `srcdoc` property descriptors | 5–15 |
| 50.x | Iframe-vs-parent comparison failed (value differs) | 15 each |

### Fingerprinting (`detectors/webgl.ts`, `detectors/canvas.ts`, `detectors/screen.ts`)

Detects WebGL virtualization, prototype method tampering, canvas blocking, and neural network screen analysis.

| Code | Signal | Risk Delta |
|---|---|---|
| 35.1 | WebGL vendor is VMware (virtualized) | 30 |
| 35.3.x–35.5.x | 15 prototype methods writable or non-native | 5–15 |
| 47.1 | Canvas 2D context unavailable (blocked) | 25 |
| 47.2 | Canvas pixel data all zeros (noise injection) | 30 |
| 32.1.x–32.4.x | `screen.width`, `height`, `orientation` descriptors | 5–15 |

### Behavioral (`detectors/headless.ts`)

Tracks page visit frequency via localStorage.

| Code | Signal | Risk Delta |
|---|---|---|
| 60.1 | Page reloaded more than 5 times within 2 hours | 5 |
| 60.2 | localStorage is disabled or cleared | 3 |
| 60.3 | localStorage access error | 8 |

## Scoring

The scoring system converts raw signal codes into a risk-based verdict.

### riskScore formula

```
riskScore = signalSum
          + min(errors * 8, 20)                     // runtime error penalty
          + (environmentFlag ? 30 : 0)               // direct file open or NN score
          + min(trueComparisons * 15, 30)            // iframe comparison diffs
          + (activeCategories - 1) * 5               // cross-category density bonus
riskScore = min(riskScore, 100)
```

### verdict thresholds

| riskScore | verdict | riskLevel | confidence |
|---|---|---|---|
| 0–15 | `human` | `low` | 100–85 |
| 16–40 | `suspicious` | `medium` | 84–60 |
| 41–50 | `suspicious` | `high` | 59–50 |
| 51–70 | `bot` | `high` | 49–30 |
| 71–100 | `bot` | `critical` | 29–0 |

`confidence = 100 - riskScore` (rounded to 2 decimals)

Full scoring details in `docs/scoring.md`.

## The `direct` field

`direct` is a top-level boolean that indicates whether the HTML file was opened directly from the filesystem (`file://` protocol) rather than served over HTTP. It checks three conditions:

1. `document.referrer === ""` — no HTTP Referer header
2. `document.location.search === ""` — no URL query string
3. `document.location.pathname` contains `.html`

If all three pass, `direct` is `true`. This catches bot frameworks that load pages from disk rather than through a web server.

Note: `direct` only tracks the file-open check. The separate `environmentFlag` (visible in debug mode) also includes the neural network screen score (>0.3).

## Project Structure

```
src/
  analyze.ts                    — main orchestrator (runs all detectors sequentially)
  index.ts                      — public barrel exports
  detectors/
    webdriver.ts                — automation tool detection
    headless.ts                 — headless browser + integrity + storage
    iframe.ts                   — iframe element integrity
    webgl.ts                    — WebGL virtualization detection
    canvas.ts                   — canvas render test + prototype checks
    screen.ts                   — screen heuristics + integrity + neural network
  scoring/
    risk.ts                     — signal decoding + risk score computation
    confidence.ts               — verdict / riskLevel / confidence from riskScore
  types/
    index.ts                    — all type definitions + signal code registry
  utils/
    helpers.ts                  — iframe creation/cleanup, native property helpers
```

## Performance

`analyze()` completes synchronously in **2–8ms** in modern browsers (Chrome, Firefox, Safari). The most expensive operations are the WebGL canvas contexts (created and destroyed within the function) and the iframe creation/cleanup. No network requests, no async operations, no timers.

## Browser Support

| Browser | Minimum version | Notes |
|---|---|---|
| Chrome | 60+ | Full support |
| Firefox | 55+ | Full support |
| Safari | 12+ | Full support |
| Edge | 79+ (Chromium) | Full support |
| Node.js | 16+ | Requires `jsdom` or browser environment (tests use jsdom) |

## Integration Examples

### React

```tsx
import { analyze } from "truehuman"

function BotCheck() {
  const result = analyze()
  if (result.verdict === "bot") {
    return <div>Access denied</div>
  }
  return <div>Welcome, human</div>
}
```

### Vue 3

```ts
import { analyze } from "truehuman"
import { ref } from "vue"

const result = ref(analyze())
const isBot = computed(() => result.value.verdict === "bot")
```

### Express middleware (Node.js)

```ts
import { analyze } from "truehuman"
import { JSDOM } from "jsdom"

function botDetectionMiddleware(req, res, next) {
  const dom = new JSDOM("<!DOCTYPE html>", { url: req.url })
  global.window = dom.window
  global.document = dom.window.document
  // ... set up remaining globals ...

  const result = analyze()
  if (result.verdict === "bot") {
    return res.status(403).json({ error: "Automated access detected" })
  }
  next()
}
```

## Testing

```bash
npm test              # Vitest with jsdom (6 tests)
npm run test:watch    # Watch mode
```

## Build

```bash
npm run build         # Rollup → CJS, ESM, UMD + .d.ts
```

Outputs to `dist/`:

| File | Format | Use |
|---|---|---|
| `truehuman.cjs.js` | CommonJS | Node.js `require()` |
| `truehuman.esm.js` | ES Module | Bundlers (Vite, Webpack, Rollup) |
| `truehuman.js` | UMD (dev) | Browsers, with sourcemap |
| `truehuman.min.js` | UMD (minified) | Production browsers |
| `index.d.ts` | TypeScript declarations | IDE support |

## Documentation

| File | Contents |
|---|---|
| `docs/api.md` | Full API reference with all interfaces and examples |
| `docs/scoring.md` | Complete scoring formula, verdict thresholds, risk delta tables |
| `docs/signals.md` | Full signal registry with every code, description, and risk value |

## Development

```bash
git clone https://github.com/code-hemu/truehuman.git
cd truehuman
npm install
npm run dev            # watch mode for tests
```

### Adding a new detector

1. Create `src/detectors/<name>.ts` — export a function that returns `(string | number)[]`
2. Add signal codes to the registry in `src/types/index.ts` (the `EXACT` map)
3. Add the function call to `src/analyze.ts` in its own try-catch block
4. Document new signals in `docs/signals.md`

## Security

- All analysis is **client-side** — no data is transmitted
- The iframe is sandboxed with `allow-same-origin` only; no scripts or navigation
- Canvas/WebGL contexts are created, used, and destroyed within a single synchronous call
- localStorage keys are namespaced per pathname; no cross-origin data leaks
- No cookies, no tracking IDs, no fingerprint databases

## License

GPL-3.0