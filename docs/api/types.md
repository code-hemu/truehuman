# TypeScript Types

All types are exported from the package:

```typescript
import type {
  AnalyzeResult,
  AnalyzeOptions,
  RecaptchaOptions,
  TurnstileOptions,
  Plugin,
  PluginResult,
} from "truehuman"
```

## `AnalyzeResult`

```typescript
interface AnalyzeResult {
  visitorId: string
  referrer: "direct" | "internal" | "external" | "file" | "localhost"
  visitor: "human" | "suspicious" | "bot"
  risk: { score: number; level: "low" | "medium" | "high" | "critical" }
  confidence: number
  components: Partial<Record<CheckComponent, ComponentEntry>>
  debug?: DebugInfo
}
```

## `AnalyzeOptions`

```typescript
interface AnalyzeOptions {
  mode?: "public" | "debug"
  plugins?: Plugin[]
}
```

## `RecaptchaOptions`

```typescript
interface RecaptchaOptions {
  siteKey: string
  action?: string
  endpoint: string
  threshold?: number
  referrer?: "direct" | "internal" | "external"
  saveTokens?: boolean
}
```

## `TurnstileOptions`

```typescript
interface TurnstileOptions {
  siteKey: string
  endpoint: string
  referrer?: "direct" | "internal" | "external"
  appearance?: "always" | "execute" | "interaction-only"
}
```

## `Plugin`

```typescript
interface Plugin {
  name: string
  fn: PluginFn
}

type PluginFn = (context?: PluginContext) => PluginResult | Promise<PluginResult>

interface PluginContext {
  integritychecks: (string | number)[]
  errors: number[]
}

interface PluginResult {
  codes?: (string | number)[]
  value?: unknown
  duration?: number
}
```

## `CheckComponent`

```typescript
type CheckComponent =
  | "audioBaseLatency" | "canvas" | "document" | "essentialApis"
  | "fonts" | "fontPreferences" | "forcedColors" | "iframe"
  | "invertedColors" | "navigation" | "navigator" | "plugins"
  | "prototype" | "recaptcha" | "screen" | "screenMeta"
  | "storage" | "timezone" | "turnstile" | "userAgent"
  | "webDriver" | "webgl"
```

## `ComponentEntry`

```typescript
interface ComponentEntry {
  duration: number
  value: any
}
```

## `DebugInfo`

```typescript
interface DebugInfo {
  integrityCodes: (string | number)[]
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}
```
