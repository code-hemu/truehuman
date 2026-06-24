# Turnstile Plugin

The Turnstile plugin integrates [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) into TrueHuman's detection pipeline. It invisibly injects the Turnstile API script into the page, renders a hidden challenge widget, executes it, and posts the resulting token to your server-side verification endpoint. This allows TrueHuman to leverage Cloudflare's bot detection infrastructure as one signal among many in the overall risk assessment.

## Usage

To activate the plugin, include `detector.turnstile(...)` in the `plugins` array passed to `analyze()`. Both `siteKey` and `endpoint` are required to configure the plugin correctly.

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

The plugin operates entirely in the background without displaying any visible challenge UI to the user, keeping the experience seamless.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteKey` | `string` | (required) | Your Cloudflare Turnstile site key, obtained from the Cloudflare dashboard |
| `endpoint` | `string` | (required) | The server-side URL that receives the token via POST and verifies it with Cloudflare |
| `referrer` | `string` | (none) | Restricts execution to a specific referrer category. Accepts `"direct"`, `"internal"`, or `"external"`. When set, the plugin skips silently if the current visit does not match the specified category |
| `appearance` | `string` | `"interaction-only"` | Controls the Turnstile widget's visual appearance mode. Defaults to `"interaction-only"` so the widget remains invisible unless Cloudflare determines an interaction is necessary |

## Flow

The plugin follows a strictly ordered sequence of steps when executed. If any step fails, the plugin reports an infrastructure error and does not contribute a bot signal to the risk score.

1. **Referrer filter** - If a `referrer` value is configured, the plugin checks whether the current page visit matches the specified category. If it does not match, the plugin exits silently without running or affecting the result.

2. **Script injection** - The Cloudflare Turnstile JavaScript API is injected into the page using the `?render=explicit` query parameter, which prevents the widget from auto-rendering and gives the plugin full control over when rendering occurs.

3. **Widget rendering** - A hidden `<div>` element is appended to the DOM and passed to `turnstile.render()`. The widget is configured with `execution: "execute"` so it does not perform any challenge work until explicitly told to do so.

4. **Widget execution** - `turnstile.execute()` is called, triggering Cloudflare's bot assessment. At this point Cloudflare analyzes browser signals and environment characteristics to determine whether the visitor is likely human.

5. **Token polling** - The plugin polls the DOM for the value of `input[name='cf-turnstile-response']`, which Turnstile populates once execution completes. Polling continues for up to 15 seconds before timing out.

6. **Token submission** - Once the token is available, the plugin sends a POST request to the configured `endpoint` with the body `{ token }`. Your server is responsible for forwarding this token to Cloudflare's siteverify API and returning the verification result.

7. **Cleanup** - The hidden widget element is removed from the DOM after the token has been submitted, leaving no visible or structural trace of the challenge in the page.

## Expected Endpoint Response

Your server-side endpoint must verify the token by forwarding it to Cloudflare's `siteverify` API using your secret key. Once verification is complete, the endpoint must return a JSON response in the following shape:

```json
{ "success": true }
```

If Cloudflare determines the token is invalid, expired, or was already used, return `{ "success": false }` instead. Any response other than `{ "success": true }` will be treated as a failed verification and will contribute risk to the overall TrueHuman score.

## Error Codes

Errors produced by this plugin follow the `91.x` namespace. Each code represents a distinct failure mode, and risk values are assigned based on whether the failure carries bot evidence or is the result of an infrastructure problem.

| Code | Condition | Risk |
|------|-----------|------|
| `91.1` | The endpoint returned `success: false`, indicating Cloudflare rejected the submitted token | 25 |
| `91.2` | A failure occurred at any infrastructure step: script failed to load, widget failed to render or execute, the POST request failed, or the 15-second polling timeout was reached | 0 |

Error codes with a risk value of `0` are classified as infrastructure errors. They indicate that something went wrong with the challenge process itself rather than with the visitor's behavior, so they do not count as bot evidence and do not increase the visitor's risk score. Only `91.1` contributes risk, because a rejected token is a meaningful signal that Cloudflare identified the session as suspicious.