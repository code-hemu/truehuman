# TypeScript Types

All public types used by TrueHuman are exported directly from the package root. You can import any combination of them in a single statement:

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

These types cover the full surface area of the library: analysis results, configuration options, third-party CAPTCHA integrations, and the plugin extension system.

---

## `AnalyzeResult`

The primary output type returned by the `.analyze()` method. It provides a comprehensive snapshot of the visitor evaluation, including identity, risk scoring, referral source, and per-component diagnostic data.

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

### Fields

**`visitorId`** - A unique string identifier generated for the current visitor session. This value is stable within a session and can be used to correlate multiple analysis calls from the same visitor.

**`referrer`** - Describes how the visitor arrived at the current page. The possible values represent the five recognized referral contexts:

- `"direct"` - No referrer was present; the user likely typed the URL or used a bookmark.
- `"internal"` - The visitor navigated from another page on the same origin.
- `"external"` - The visitor arrived from a different domain.
- `"file"` - The page was loaded from the local filesystem (`file://` protocol).
- `"localhost"` - The request originated from a local development environment.

**`visitor`** - The top-level classification of the visitor based on all collected signals:

- `"human"` - The visitor passed enough checks to be considered a real user.
- `"suspicious"` - Some signals suggest automation or anomalous behavior, but not conclusively.
- `"bot"` - The visitor exhibits strong indicators of automated or non-human traffic.

**`risk`** - An object containing two properties:

- `score` - A numeric risk value, typically in the range `0` to `1`, where higher values indicate greater risk.
- `level` - A human-readable classification derived from the score: `"low"`, `"medium"`, `"high"`, or `"critical"`.

**`confidence`** - A numeric value between `0` and `1` representing how certain TrueHuman is about the `visitor` classification. A high confidence score means the collected signals were consistent and unambiguous.

**`components`** - A partial record mapping each `CheckComponent` key to its corresponding `ComponentEntry`. Only components that were actually evaluated during the analysis run will be present. Each entry contains the raw output value and the time taken to compute it.

**`debug`** - An optional `DebugInfo` object, present only when the analysis is run in `"debug"` mode. Contains low-level diagnostic information about integrity codes, iframe comparisons, environment flags, and any errors encountered during evaluation.


## `AnalyzeOptions`

Configuration options passed to the `.analyze()` method to control how the analysis is performed.

```typescript
interface AnalyzeOptions {
  mode?: "public" | "debug"
  plugins?: Plugin[]
}
```

### Fields

**`mode`** - Controls what information is included in the result:

- `"public"` - The default mode. Returns the standard `AnalyzeResult` fields without internal diagnostic data.
- `"debug"` - Includes the `debug` field on the result, exposing integrity codes, error arrays, and other low-level signals useful during development and testing.

**`plugins`** - An optional array of `Plugin` objects that extend the analysis with custom checks. Each plugin runs alongside the built-in component checks and can contribute additional signals to the evaluation. See the `Plugin` type for more detail.


## `RecaptchaOptions`

Configuration for enabling Google reCAPTCHA v3 as a supplementary verification signal inside TrueHuman.

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

### Fields

**`siteKey`** - Your Google reCAPTCHA v3 site key, obtained from the Google reCAPTCHA admin console. This is the public key used to initialize the reCAPTCHA widget.

**`action`** - An optional action name string that identifies the context in which reCAPTCHA is being invoked (for example, `"login"` or `"checkout"`). Used by Google to improve score accuracy.

**`endpoint`** - The URL of your server-side endpoint that verifies the reCAPTCHA token against the Google siteverify API. TrueHuman will POST the token to this endpoint.

**`threshold`** - An optional score threshold between `0.0` and `1.0`. If the score returned by reCAPTCHA falls below this value, the visitor is treated as suspicious or non-human. Defaults to Google's recommended value if omitted.

**`referrer`** - Restricts reCAPTCHA verification to visitors matching the specified referral type. Useful for only challenging visitors arriving from external sources, for example.

**`saveTokens`** - When set to `true`, reCAPTCHA tokens are cached and reused where possible to reduce unnecessary verification requests. Defaults to `false`.


## `TurnstileOptions`

Configuration for enabling Cloudflare Turnstile as a supplementary verification signal inside TrueHuman.

```typescript
interface TurnstileOptions {
  siteKey: string
  endpoint: string
  referrer?: "direct" | "internal" | "external"
  appearance?: "always" | "execute" | "interaction-only"
}
```

### Fields

**`siteKey`** - Your Cloudflare Turnstile site key, obtained from the Cloudflare dashboard.

**`endpoint`** - The URL of your server-side endpoint responsible for verifying the Turnstile token using the Cloudflare siteverify API.

**`referrer`** - Optionally limits Turnstile verification to visitors matching a specific referral source, functioning the same way as the equivalent field on `RecaptchaOptions`.

**`appearance`** - Controls how and when the Turnstile widget is rendered and interacted with:

- `"always"` - The widget is always rendered visibly on the page.
- `"execute"` - The widget renders but executes silently without user interaction when possible.
- `"interaction-only"` - The widget only becomes visible when user interaction is required to complete the challenge.


## `Plugin`

The interface for extending TrueHuman with custom analysis logic. A plugin contributes an additional signal to the analysis pipeline by running a user-defined function alongside the built-in component checks.

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

### Fields on `Plugin`

**`name`** - A unique string identifier for the plugin. This name appears in diagnostic output and is used to reference the plugin's contribution in results.

**`fn`** - The plugin function, typed as `PluginFn`. It optionally receives a `PluginContext` and must return either a `PluginResult` or a `Promise<PluginResult>`, making async checks fully supported.

### `PluginContext`

Passed as the first argument to `fn` when invoked. It gives the plugin read access to data accumulated so far during the current analysis run:

- `integritychecks` - An