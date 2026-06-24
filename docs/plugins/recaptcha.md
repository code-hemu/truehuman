# reCAPTCHA Plugin

The reCAPTCHA plugin integrates Google reCAPTCHA v3 into TrueHuman's analysis pipeline. When included as a detector plugin, it automatically injects the reCAPTCHA API script into the page, requests a challenge token on behalf of the user, and sends that token to your backend for server-side score verification. The resulting score is then interpreted as a signal within TrueHuman's overall risk assessment.

Unlike reCAPTCHA v2, which presents visible checkbox or image challenges, reCAPTCHA v3 operates entirely in the background. It assigns a continuous score between `0.0` and `1.0` based on behavioral analysis, where scores near `1.0` indicate likely human activity and scores near `0.0` indicate likely automated behavior. The plugin maps this score onto TrueHuman's error code system and contributes to the final risk total when a suspicious score is detected.

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
| `siteKey` | `string` | (required) | Your Google reCAPTCHA v3 site key, obtained from the Google reCAPTCHA admin console |
| `endpoint` | `string` | (required) | The URL of your backend endpoint that will receive the token and perform server-side verification |
| `action` | `string` | `"submit"` | A label identifying the context of the reCAPTCHA challenge; used for scoring differentiation in the Google dashboard |
| `threshold` | `number` | `0.5` | The minimum acceptable score; sessions scoring below this value are flagged with risk code `90.1` |
| `referrer` | `string` | (unset) | When set, restricts the plugin to run only when the page referrer matches the specified type: `"direct"`, `"internal"`, or `"external"` |
| `saveTokens` | `boolean` | `false` | When `true`, skips reCAPTCHA execution entirely if the feathers layer has already emitted integrity codes for this session |

### `action`

The `action` string is a free-form label you define to identify the interaction being protected, such as `"login"`, `"checkout"`, or `"contact_form"`. Google uses this value to group score statistics in the reCAPTCHA admin console, making it easier to monitor bot activity per interaction type. It does not affect scoring logic on TrueHuman's side.

### `referrer`

The `referrer` option provides a lightweight traffic-source filter. When set, the plugin inspects `document.referrer` and compares it against the specified type before executing:

- `"direct"` matches sessions with no referrer, typically direct URL entry or bookmark access
- `"internal"` matches referrers from the same origin as the current page
- `"external"` matches referrers from a different origin

If the referrer does not match the configured type, the plugin exits silently without injecting the reCAPTCHA script or issuing any error codes.

### `saveTokens`

When `saveTokens` is enabled, the plugin checks whether TrueHuman's feathers detection layer has already emitted integrity-related codes before executing the reCAPTCHA challenge. If integrity codes are present, the plugin skips the reCAPTCHA request entirely. This avoids redundant network calls in sessions where bot evidence has already been collected through other signals, reducing latency and unnecessary third-party requests.

## Execution Flow

The plugin follows a deterministic sequence of steps each time `analyze()` is called with it included:

**Step 1 - Referrer Filter**
If a `referrer` value is configured, the plugin checks whether the current session's referrer matches the expected type. If it does not match, the plugin halts immediately and emits no codes, as though it was never invoked.

**Step 2 - saveTokens Check**
If `saveTokens` is `true`, the plugin inspects the feathers layer output. If any integrity codes have already been emitted in this session, the plugin exits without executing reCAPTCHA, treating the session as already evaluated.

**Step 3 - Script Injection**
The reCAPTCHA v3 API script is injected into the page as a `<script>` tag with the `?render={siteKey}` query parameter, which initializes the library in explicit rendering mode.

**Step 4 - grecaptcha.ready()**
The plugin waits for the `grecaptcha.ready()` callback to fire, confirming that the reCAPTCHA API has fully loaded and is ready to accept execution calls.

**Step 5 - Token Execution**
The plugin calls `grecaptcha.execute(siteKey, { action })` to request a signed challenge token. This token encodes the session's behavioral signals as assessed by Google's infrastructure.

**Step 6 - POST to Endpoint**
The token and action label are sent to your configured `endpoint` as a JSON POST request with the body `{ token, action }`. Your server is expected to forward the token to Google's `siteverify` API and return a structured response.

**Step 7 - Response Interpretation**
The plugin parses the response returned by your endpoint and maps the outcome to TrueHuman error codes based on the score, success flag, and any failure conditions encountered during the above steps.

## Expected Endpoint Response

Your backend endpoint must verify the reCAPTCHA token by calling Google's `siteverify` API server-side and return a JSON response in the following format:

```json
{ "success": true, "score": 0.9 }
```

The `success` field indicates whether Google accepted the token as valid. The `score` field must be a floating-point number between `0.0` and `1.0` representing the human-likelihood score for the session. Omitting either field, or returning `success: false`, will cause the plugin to emit error code `90.3`.

Server-side verification is required because reCAPTCHA tokens must be validated using your secret key, which must never be exposed to the client. The plugin itself only handles the client-side token acquisition and response parsing.

## Error Codes

| Code | Condition | Risk |
|------|-----------|------|
| `90.1` | The verified score returned by the endpoint falls below the configured `threshold` | 25 |
| `90.2` | A failure occurred during script loading, token execution, or the fetch request to the endpoint | 0 |
| `90.3` | The endpoint returned `success: false`, or the response body did not include a valid `score` field | 0 |

Codes `90.2` and `90.3` carry a risk value of `0` because they represent infrastructure or configuration failures rather than evidence of bot activity. These codes are recorded in the analysis result for diagnostic purposes but do not contribute to the session's total risk score. Only `90.1`, which indicates a low human-likelihood score from Google's assessment, is weighted as a bot signal.