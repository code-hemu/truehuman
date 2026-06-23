# Vanilla JS Example

A complete working example is available at `examples/vanilla-js/index.html`.

Run it locally:

```bash
npx serve examples/vanilla-js
```

The example demonstrates:
- Loading truehuman from the UMD bundle
- Running `analyze()` with debug mode and reCAPTCHA/Turnstile plugins
- Rendering the result (visitor, score, components, debug info)

## Key snippet

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
