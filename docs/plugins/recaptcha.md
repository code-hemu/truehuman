# reCAPTCHA Plugin

Google reCAPTCHA v3 plugin. Injects the reCAPTCHA API script, executes `grecaptcha.execute()`, and POSTs the token to your endpoint.

## Usage

```typescript
import { analyze, detector } from "truehuman"

const result = await analyze({
  plugins: [
    detector.grecaptcha({
      siteKey: "6Lc...",
      action: "submit",
      endpoint: "https://your-api.com/verify-recaptcha",
      threshold: 0.5,
    }),
  ],
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteKey` | `string` | (required) | Google reCAPTCHA v3 site key |
| `endpoint` | `string` | (required) | Server endpoint to POST the token |
| `action` | `string` | `"submit"` | reCAPTCHA action name |
| `threshold` | `number` | `0.5` | Score below this triggers code `90.1` |
| `referrer` | `string` | — | Only run if referrer matches (`"direct"`, `"internal"`, `"external"`) |
| `saveTokens` | `boolean` | `false` | Skip reCAPTCHA if feathers already emitted integrity codes |

## Flow

1. Referrer filter (skips silently if filtered)
2. If `saveTokens` is true and feathers has integrity codes, skip
3. Inject reCAPTCHA script (`?render={siteKey}`)
4. Wait for `grecaptcha.ready()`
5. Execute `grecaptcha.execute(siteKey, { action })`
6. POST `{ token, action }` to `endpoint`
7. Interpret response

## Expected endpoint response

The endpoint should verify the token with Google's siteverify API and return:

```json
{ "success": true, "score": 0.9 }
```

## Error codes

| Code | Condition | Risk |
|------|-----------|------|
| `90.1` | Score below threshold | 25 |
| `90.2` | Script load, execute, or fetch failure | 0 |
| `90.3` | Endpoint returned `success: false` or missing `score` | 0 |

Codes with risk 0 are infrastructure errors that do not count as bot evidence.
