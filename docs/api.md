# API Reference

## `analyze(mode?)`

Performs browser integrity analysis and returns a verdict.

```ts
import { analyze } from "truehuman"

// Public mode (default) — lightweight verdict
const result = analyze()
// → { verdict, human, riskScore, riskLevel, confidence, checks: { passed, suspicious, failed } }

// Detailed mode — per-category results with evidence
const detailed = analyze("detailed")
// → { verdict, human, riskScore, riskLevel, confidence, checks: CheckResult[] }

// Debug mode — detailed + raw internals
const debug = analyze("debug")
// → { ..., checks: CheckResult[], debug: DebugInfo }
```

## Return Type

```ts
interface AnalyzeResult {
  verdict: "human" | "suspicious" | "bot"
  human: boolean
  riskScore: number        // 0–100
  riskLevel: "low" | "medium" | "high" | "critical"
  confidence: number       // 0–100
  checks: CheckResult[] | { passed: number; suspicious: number; failed: number }
  debug?: DebugInfo
}
```

### `checks` by mode

| Mode | Shape |
|---|---|
| `"public"` | `{ passed, suspicious, failed }` — counts per status |
| `"detailed"` | `CheckResult[]` — one entry per category |
| `"debug"` | `CheckResult[]` — same as detailed |

### `CheckResult`

```ts
interface CheckResult {
  name: CheckCategory
  status: "pass" | "suspicious" | "fail"
  riskDelta: number
  evidence: CheckEvidence[]
}
```

### `CheckCategory`

| Category | Scope |
|---|---|
| `automation` | Selenium, Playwright, Puppeteer, DevTools, browser flags |
| `browser_integrity` | UA, APIs, navigation timing, property descriptor integrity |
| `iframe_integrity` | Iframe element integrity, cross-context comparison diffs |
| `fingerprinting` | WebGL virtualization, prototype method override detection |
| `behavioral` | localStorage frequency analysis |

### `CheckEvidence`

```ts
interface CheckEvidence {
  detector: string    // internal module name
  message: string     // human-readable description
  code: number | string  // signal code (e.g. 41, "35.3.1")
}
```

### `DebugInfo`

```ts
interface DebugInfo {
  integrityCodes: (string | number)[]  // all raw codes
  iframeComparisons: number            // total iframe-vs-parent checks
  environmentFlag: boolean | null      // legacy usgcp flag
  errors: number[]                     // block-level error codes
}
```

## Quick Start

```html
<script src="dist/truehuman.min.js"></script>
<script>
  const r = truehuman.analyze()
  if (r.verdict === "bot") {
    console.log("Blocking automated access")
  }
</script>
```

```js
// Node (ESM)
import { analyze } from "truehuman"
const { verdict, riskScore, confidence } = analyze()
```
