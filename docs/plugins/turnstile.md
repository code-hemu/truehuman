# Turnstile Plugin

Cloudflare Turnstile plugin. Injects the Turnstile API script, renders a hidden widget, executes it, and POSTs the token to your endpoint.

## Usage

```typescript
import { analyze, detector } from "truehuman"

const result = await analyze({
  plugins: [
    detector.turnstile({
      siteKey: "0x4AAAA...",
      endpoint: "https://your-api.com/verify-turnstile",
    }),
  ],
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteKey` | `string` | (required) | Cloudflare Turnstile site key |
| `endpoint` | `string` | (required) | Server endpoint to POST the token |
| `referrer` | `string` | — | Only run if referrer matches (`"direct"`, `"internal"`, `"external"`) |
| `appearance` | `string` | `"interaction-only"` | Turnstile widget appearance mode |

## Flow

1. Referrer filter (skips silently if filtered)
2. Inject Turnstile script (`?render=explicit`)
3. Render a hidden `<div>` widget with `execution: "execute"`
4. Execute `turnstile.execute()`
5. Poll for `input[name='cf-turnstile-response']` value (15s timeout)
6. POST `{ token }` to `endpoint`
7. Clean up widget from DOM

## Expected endpoint response

The endpoint should verify the token with Cloudflare's siteverify API and return:

```json
{ "success": true }
```

## Error codes

| Code | Condition | Risk |
|------|-----------|------|
| `91.1` | Endpoint returned `success: false` | 25 |
| `91.2` | Script load, render, execute, fetch failure, or timeout | 0 |

Codes with risk 0 are infrastructure errors that do not count as bot evidence.
