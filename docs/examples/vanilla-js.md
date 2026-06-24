# Vanilla JS Example

A complete, self-contained working example is available at `examples/vanilla-js/index.html`. This example is designed for developers who want to quickly see TrueHuman in action without a build tool, bundler, or framework. It runs entirely in the browser using a plain HTML file and the prebuilt UMD bundle.

## Running Locally

To serve the example on a local development server, run the following command from the project root:

```bash
npx serve examples/vanilla-js
```

This starts a local static file server and opens the example in your browser. No installation or configuration is required beyond having Node.js available.

## What the Example Demonstrates

The example walks through a complete integration of TrueHuman in a minimal browser environment and covers the following:

- **Loading TrueHuman from the UMD bundle** - the prebuilt `truehuman.min.js` file is loaded directly via a `<script>` tag, making the global `truehuman` object available immediately without any module system or import statements.
- **Running `analyze()` with debug mode** - the `analyze()` call is configured with `mode: "debug"`, which enables verbose internal signal collection and exposes detailed scoring breakdowns in the result object.
- **Using reCAPTCHA and Turnstile plugins** - the example shows how to attach third-party CAPTCHA verification plugins to the analysis pipeline. Each plugin contacts your own backend endpoint to verify the token server-side before contributing to the final score.
- **Rendering the full result object** - the example displays all major fields returned by `analyze()`, including the visitor identifier, the computed risk score, individual signal components, and the extended debug payload.

## Key Snippet

The core integration is straightforward. Drop the UMD bundle into your page, then call `truehuman.analyze()` with your desired options:

```html
<script src="../../dist/truehuman.min.js"></script>
<script>
  (async () => {
    const result = await truehuman.analyze({
      mode: "debug",
      plugins: [
        truehuman.detector.grecaptcha({
          siteKey: "YOUR_SITE_KEY",
          endpoint: "/api/verify",
        }),
      ],
    })

    console.log(result.visitor, result.risk.score)
  })()
</script>
```

Replace `YOUR_SITE_KEY` with the site key issued by Google reCAPTCHA or Cloudflare Turnstile for your domain. The `endpoint` field should point to a route on your own server that accepts the CAPTCHA token, verifies it with the provider's API, and returns the result. TrueHuman never contacts third-party CAPTCHA services directly from the browser - all verification is proxied through your backend to keep your secret keys private.

The `result` object returned by `analyze()` contains the following top-level fields:

| Field | Type | Description |
|---|---|---|
| `result.visitor` | `string` | A stable identifier representing this visitor's browser fingerprint |
| `result.risk.score` | `number` | A risk score from `0` to `1`, where `0` is very likely human and `1` is very likely a bot |
| `result.risk.components` | `object` | A breakdown of individual signals that contributed to the overall score |
| `result.debug` | `object` | Extended diagnostic data available when `mode` is set to `"debug"` |

The `debug` field is only populated when `mode: "debug"` is explicitly passed. In production, omit the `mode` option or set it to `"production"` to suppress the debug payload and reduce the size of the result object.