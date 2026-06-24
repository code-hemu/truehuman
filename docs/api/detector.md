# detector API

The `detector` object is the primary plugin factory in TrueHuman. It provides a set of functions that each create a pre-configured plugin object, ready to be passed into the `plugins` array of `analyze()`. Plugins are responsible for integrating third-party challenge-based verification services into the TrueHuman analysis pipeline.

```typescript
import { detector } from "truehuman"
```

Each plugin factory accepts a configuration object and returns a `Plugin` instance that handles script loading, token generation, server-side verification, and result reporting automatically during an `analyze()` call.


## `detector.grecaptcha(options)`

Creates a plugin that integrates Google reCAPTCHA v3 into the analysis pipeline. When this plugin is active, it silently requests a challenge token from Google's reCAPTCHA service and forwards it to your server endpoint for verification. The server response determines whether the visitor passes or fails the reCAPTCHA check.

Unlike reCAPTCHA v2, version 3 runs entirely in the background without displaying a visible challenge widget to the user. It assigns a score between `0.0` and `1.0` to each request, where scores closer to `1.0` indicate a likely human visitor. The `threshold` option controls the minimum acceptable score.

```typescript
detector.grecaptcha({
  siteKey: string
  action?: string                         // default "submit"
  endpoint: string                        // POSTs { token, action } here
  threshold?: number                      // default 0.5
  referrer?: "direct" | "internal" | "external"
  saveTokens?: boolean                    // default false - skip if feathers flagged
}): Plugin
```

### Options

| Option | Type | Required | Description |
|---|---|---|---|
| `siteKey` | `string` | Yes | Your reCAPTCHA v3 public site key, obtained from the Google reCAPTCHA admin console. |
| `action` | `string` | No | A label identifying the action being protected. Used in Google's reporting dashboard. Defaults to `"submit"`. |
| `endpoint` | `string` | Yes | The URL on your server that receives a `POST` request containing `{ token, action }` and verifies it against the Google reCAPTCHA API. |
| `threshold` | `number` | No | Minimum reCAPTCHA score required to pass. Scores below this value are treated as bot-like. Defaults to `0.5`. |
| `referrer` | `"direct" \| "internal" \| "external"` | No | Indicates the traffic source of the current visitor. Can be used server-side to adjust scoring logic. |
| `saveTokens` | `boolean` | No | When set to `true`, reCAPTCHA tokens are retained even if earlier analysis signals (feathers) have already flagged the visitor as suspicious. Defaults to `false`, which skips token generation in that case to avoid unnecessary API usage. |

For a complete implementation guide including server-side verification setup, see [reCAPTCHA Plugin](../plugins/recaptcha.md).


## `detector.turnstile(options)`

Creates a plugin that integrates Cloudflare Turnstile into the analysis pipeline. Turnstile is a privacy-preserving CAPTCHA alternative that validates visitors through a series of non-invasive browser and behavioural checks. It avoids user-visible puzzles in most cases and is designed to minimize friction while still distinguishing bots from real users.

When this plugin is active, it injects the Turnstile script, renders the widget according to the configured `appearance` mode, and upon completion sends the resulting token to your server endpoint for verification with the Cloudflare API.

```typescript
detector.turnstile({
  siteKey: string
  endpoint: string                        // POSTs { token } here
  referrer?: "direct" | "internal" | "external"
  appearance?: "always" | "execute" | "interaction-only"  // default "interaction-only"
}): Plugin
```

### Options

| Option | Type | Required | Description |
|---|---|---|---|
| `siteKey` | `string` | Yes | Your Cloudflare Turnstile site key, obtained from the Cloudflare dashboard. |
| `endpoint` | `string` | Yes | The URL on your server that receives a `POST` request containing `{ token }` and verifies it with the Cloudflare siteverify API. |
| `referrer` | `"direct" \| "internal" \| "external"` | No | Indicates the traffic source of the current visitor, which can be passed to your server for context-aware verification logic. |
| `appearance` | `"always" \| "execute" \| "interaction-only"` | No | Controls when and how the Turnstile widget is rendered. `"always"` renders the widget visibly at all times. `"execute"` renders it only when `.execute()` is called programmatically. `"interaction-only"` shows the widget only when Cloudflare determines that an interactive challenge is required. Defaults to `"interaction-only"`. |

For a complete implementation guide including server-side verification setup, see [Turnstile Plugin](../plugins/turnstile.md).