# analyze API

The `analyze` method is the primary interface for bot detection and visitor classification in TrueHuman. It inspects the browser environment through a collection of signal components, then produces a structured result containing a visitor fingerprint, a risk score, a human/bot classification, and optionally a full debug report.

## Signatures

`analyze` supports three calling conventions depending on whether you need synchronous output, a specific mode, or asynchronous plugin execution.

```typescript
// Synchronous - public mode (default)
analyze(): AnalyzeResult

// Synchronous - with explicit mode selection
analyze(mode: "public" | "debug"): AnalyzeResult

// Asynchronous - with plugins
analyze(options: AnalyzeOptions): Promise<AnalyzeResult>
```

When called with no arguments or with a mode string, `analyze` runs synchronously and returns an `AnalyzeResult` directly. When called with an `AnalyzeOptions` object that includes a `plugins` array, it runs asynchronously and returns a `Promise<AnalyzeResult>` instead.

## Parameters

### `AnalyzeOptions`

Passed as the sole argument when you need asynchronous execution or want to combine mode selection with plugin usage.

```typescript
interface AnalyzeOptions {
  mode?: "public" | "debug"     // default "public"
  plugins?: Plugin[]            // optional plugin array
}
```

`mode` controls how much information is included in the result. In `"public"` mode, only the fields needed for production use are present. In `"debug"` mode, the result additionally contains a `debug` object with raw integrity codes, error counts, and internal diagnostic flags, which is useful during development and integration testing.

`plugins` is an optional array of `Plugin` instances that extend or augment the analysis pipeline. When this field is provided, each plugin is executed sequentially after the built-in checks complete. Plugins may push additional error codes into the result or modify component values. Providing a non-empty `plugins` array is what causes `analyze` to return a `Promise` rather than a synchronous value.

## Return Value

All call signatures ultimately produce an `AnalyzeResult`, either directly or wrapped in a `Promise`.

```typescript
interface AnalyzeResult {
  visitorId: string
  referrer: "direct" | "internal" | "external" | "file" | "localhost"
  visitor: "human" | "suspicious" | "bot"
  risk: {
    score: number               // 0 to 100
    level: "low" | "medium" | "high" | "critical"
  }
  confidence: number            // 0 to 100
  components: Partial<Record<CheckComponent, ComponentEntry>>
  debug?: DebugInfo             // only present in debug mode
}
```

`visitorId` is a stable hash derived from browser signals including canvas fingerprinting, WebGL renderer information, and the user agent. The same physical browser will produce the same `visitorId` across calls, making it useful for tracking repeat visits.

`referrer` categorizes the traffic origin. `"direct"` means no referrer header was present. `"internal"` means the visitor navigated from the same origin. `"external"` means the visitor arrived from a different domain. `"file"` and `"localhost"` cover local development scenarios.

`visitor` is the top-level classification. `"human"` indicates no significant bot signals were detected. `"suspicious"` indicates some anomalies were found but not enough to confirm automation. `"bot"` indicates strong evidence of non-human traffic.

`risk.score` is a numeric value from 0 to 100 where higher values represent greater confidence that the visitor is a bot or automated agent. `risk.level` maps that numeric score to a human-readable severity tier: `"low"`, `"medium"`, `"high"`, or `"critical"`.

`confidence` is a separate 0 to 100 value representing how certain the engine is in its own classification, regardless of which label was assigned. A high-confidence `"human"` result is more trustworthy than a low-confidence one, and similarly for `"bot"`.

`components` is a partial record keyed by `CheckComponent` identifiers. Each entry that is present describes the outcome of one individual detector, including how long it took to run and what value it observed. Components that did not run or were skipped will not appear in the object.

`debug` is only populated when `mode` is set to `"debug"`. It contains internal diagnostic data intended for development use and should not be exposed in production responses.

### `CheckComponent`

The set of named detectors that TrueHuman runs to collect browser signals. Each key in this union corresponds to a distinct aspect of the browser environment being inspected.

```typescript
type CheckComponent =
  | "audioBaseLatency"
  | "canvas"
  | "document"
  | "essentialApis"
  | "fonts"
  | "fontPreferences"
  | "forcedColors"
  | "iframe"
  | "invertedColors"
  | "navigation"
  | "navigator"
  | "plugins"
  | "prototype"
  | "recaptcha"
  | "screen"
  | "screenMeta"
  | "storage"
  | "timezone"
  | "turnstile"
  | "userAgent"
  | "webDriver"
  | "webgl"
```

Each component targets a specific attack surface or consistency check. For example, `"webDriver"` inspects properties that automation frameworks like Selenium or Puppeteer expose on the `navigator` object. `"canvas"` and `"webgl"` collect rendering fingerprints. `"prototype"` checks for tampered or missing native prototype methods that headless environments sometimes fail to replicate correctly. `"fonts"` and `"fontPreferences"` assess the availability and rendering of installed system fonts.

### `ComponentEntry`

Each entry in the `components` record follows this shape.

```typescript
interface ComponentEntry {
  duration: number    // time taken to run this check, in milliseconds
  value: any          // the raw signal value collected by the detector
}
```

`duration` is useful for profiling the cost of individual detectors. `value` is detector-specific and may be a primitive, an object, an array, or a boolean depending on what that component measures.

### `DebugInfo`

Only present on the result when `mode` is `"debug"`. Contains internal state that is not exposed in production mode.

```typescript
interface DebugInfo {
  integrityCodes: (string | number)[]
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}
```

`integrityCodes` is the full list of internal codes emitted during analysis. These codes identify specific signal patterns or anomalies detected during the run and can help diagnose why a particular classification was assigned.

`iframeComparisons` is the count of cross-frame consistency checks that were performed. TrueHuman compares certain properties between the top frame and embedded iframes to detect spoofing techniques that only affect one execution context.

`environmentFlag` is a nullable boolean that represents an internal environment sanity check. A value of `null` means the check was inconclusive, `true` means the environment passed, and `false` means an inconsistency was detected.

`errors` is a list of numeric error codes encountered during the analysis run. These do not necessarily prevent a result from being produced, but they may indicate degraded signal quality or skipped components.