# analyze API

## Signatures

```typescript
// Synchronous — public mode (default)
analyze(): AnalyzeResult

// Synchronous — debug mode
analyze(mode: "public" | "debug"): AnalyzeResult

// Asynchronous — with plugins
analyze(options: AnalyzeOptions): Promise<AnalyzeResult>
```

## Parameters

### `AnalyzeOptions`

```typescript
interface AnalyzeOptions {
  mode?: "public" | "debug"     // default "public"
  plugins?: Plugin[]            // optional plugin array
}
```

When `plugins` is provided, the return value is a Promise. Each plugin runs sequentially and can push error codes into the results.

## Return value

```typescript
interface AnalyzeResult {
  visitorId: string             // consistent hash from canvas/WebGL/UA
  referrer: "direct" | "internal" | "external" | "file" | "localhost"
  visitor: "human" | "suspicious" | "bot"
  risk: {
    score: number               // 0–100
    level: "low" | "medium" | "high" | "critical"
  }
  confidence: number            // 0–100
  components: Partial<Record<CheckComponent, ComponentEntry>>
  debug?: DebugInfo             // only in debug mode
}
```

### `CheckComponent`

```typescript
type CheckComponent =
  | "audioBaseLatency" | "canvas" | "document" | "essentialApis"
  | "fonts" | "fontPreferences" | "forcedColors" | "iframe"
  | "invertedColors" | "navigation" | "navigator" | "plugins"
  | "prototype" | "recaptcha" | "screen" | "screenMeta"
  | "storage" | "timezone" | "turnstile" | "userAgent"
  | "webDriver" | "webgl"
```

### `ComponentEntry`

```typescript
interface ComponentEntry {
  duration: number              // ms
  value: any                    // detector-specific value
}
```

### `DebugInfo`

```typescript
interface DebugInfo {
  integrityCodes: (string | number)[]   // all emitted codes
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}
```
