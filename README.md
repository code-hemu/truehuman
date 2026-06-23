<p align="center">
  <a href="https://github.com/code-hemu/truehuman">
    <picture>
      <img src="https://raw.githubusercontent.com/code-hemu/truehuman/refs/heads/main/resources/logo.png" alt="TrueHuman logo" width="312px" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/truehuman"><img src="https://img.shields.io/npm/v/truehuman" alt="Version"></a>
  <a href="https://www.npmjs.com/package/truehuman"><img src="https://img.shields.io/npm/dt/truehuman" alt="Downloads"></a>
  <a href="https://github.com/code-hemu/truehuman/blob/master/LICENSE"><img src="https://img.shields.io/github/license/code-hemu/truehuman" alt="License"></a>
  <a href="https://www.jsdelivr.com/package/npm/truehuman"><img src="https://data.jsdelivr.com/v1/package/npm/truehuman/badge?style=rounded" alt="jsDelivr"></a>
</p>

TrueHuman is a bot detection library for web applications. It performs browser integrity checks and uses passive fingerprinting signals to create a risk score. Optional reCAPTCHA and Turnstile plugins offer extra server-side verification.

[![TrueHuman Screenshot](https://raw.githubusercontent.com/code-hemu/truehuman/refs/heads/main/resources/screenshot.png)](https://raw.githubusercontent.com/code-hemu/truehuman/refs/heads/main/resources/screenshot.png)

## Features

- **20+ passive detectors** - Inspects canvas output, WebGL metadata, installed fonts, audio context latency, screen geometry, navigator object properties, and known automation flags left behind by headless browsers and driver frameworks.
- **Plugin system** - Integrates with Google reCAPTCHA v3 and Cloudflare Turnstile to add server-validated signals on top of the passive client-side checks, giving you a layered defence that is much harder to spoof.
- **Risk scoring** - Produces a cumulative 0 to 100 risk score alongside a verdict of `human`, `suspicious`, or `bot`, and a confidence value that is the direct inverse of the risk score.
- **Zero runtime dependencies** - The entire library ships as roughly 10 KB when gzipped, with no third-party packages required at runtime. Optional plugin dependencies are loaded only when you configure a plugin.
- **UMD / ESM / CJS** - Distributed in all three module formats so it works natively with any modern bundler, import system, or via a plain script tag from a CDN.


## Quick Start

Install the package from npm:

```bash
npm install truehuman
```

Import and call `analyze()` anywhere in your client-side code. The function is synchronous by default and returns a result object immediately:

```typescript
import { analyze } from "truehuman"

const result = analyze()
console.log(result.visitor)      // "human" | "suspicious" | "bot"
console.log(result.risk.score)   // 0 to 100
console.log(result.confidence)   // 0 to 100
```

The `visitor` field gives you a plain-language verdict. The `risk.score` field gives you the raw number behind that verdict so you can apply your own thresholds if needed.


### CDN

If you are not using a bundler, load TrueHuman directly from jsDelivr and access it through the global `truehuman` namespace:

```html
<script src="https://cdn.jsdelivr.net/npm/truehuman/dist/truehuman.min.js"></script>
<script>
  const result = truehuman.analyze()
  console.log(result.visitor)
</script>
```


### Sync vs Async

`analyze()` supports both synchronous and asynchronous usage depending on whether you configure any plugins:

```typescript
// Synchronous usage: no plugins configured, result is returned immediately
const result = analyze()

// Asynchronous usage: plugins require a network round-trip, so analyze() returns a Promise
const result = await analyze({ plugins: [...] })
```

When called without plugins, `analyze()` is entirely local and produces no network traffic. As soon as you add a plugin, the call becomes asynchronous and must be awaited.


### Debug Mode

Pass the string `"debug"` as the first argument to enable debug mode. In this mode, the result object includes an additional `debug` field that exposes the internal signals collected during analysis:

```typescript
const result = analyze("debug")
console.log(result.debug)
// {
//   integrityCodes: [...],   codes that fired during this evaluation
//   iframeComparisons: N,    number of cross-frame property mismatches detected
//   environmentFlag: ...,    set when running in a file:// origin or NN environment
//   errors: [...]            list of detectors that threw an exception at runtime
// }
```

Debug mode is useful during development to understand why a particular visitor received a specific score, or to audit which detectors are firing in your environment. It is not recommended for production use as it exposes internal signal data.


### Result Fields

Every call to `analyze()` returns an object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `visitorId` | `string` | An 8-character hexadecimal hash derived from canvas output, WebGL renderer data, and the user agent string. Consistent for the same real browser across short sessions. |
| `referrer` | `string` | Categorised referrer context. One of `direct`, `internal`, `external`, `file`, or `localhost`. |
| `visitor` | `string` | The human-readable verdict. `human` for scores 0 to 15, `suspicious` for 16 to 40, and `bot` for 41 to 100. |
| `risk.score` | `number` | Cumulative risk score from 0 to 100. Higher values indicate stronger bot signals. |
| `risk.level` | `string` | Banded risk label. One of `low`, `medium`, `high`, or `critical`. |
| `confidence` | `number` | Confidence that the visitor is human, expressed as `100 minus risk.score`. A score of 20 yields a confidence of 80. |
| `components` | `object` | A map of every detector that ran, including its execution duration in milliseconds and the raw value it produced. Useful for auditing which signals contributed to the score. |
| `debug` | `object` | Present only when `analyze("debug")` is called. Contains internal signal details as described in the Debug Mode section above. |


### With Plugins

To enable server-side verification alongside the passive client-side checks, import the `detector` namespace and pass one or more plugin instances in the options object:

```typescript
import { analyze, detector } from "truehuman"

const result = await analyze({
  plugins: [
    detector.grecaptcha({
      siteKey: "YOUR_SITE_KEY",
      endpoint: "/api/verify-recaptcha",
    }),
  ],
})
```

The `endpoint` field should point to a server route you control. TrueHuman sends the token generated by the third-party service to that endpoint, and your server is responsible for verifying it against the reCAPTCHA or Turnstile API and returning a result. This keeps your secret keys off the client. See the plugin-specific guides in the documentation for the full request and response shape expected by each plugin.


## Documentation

Full documentation is available in the [`docs/`](docs/) folder. Each file covers a specific area of the library:

| File | Contents |
|------|----------|
| [docs/getting-started.md](docs/getting-started.md) | Installation instructions, CDN usage, and a basic integration walkthrough |
| [docs/api/analyze.md](docs/api/analyze.md) | Full reference for the `analyze()` function including all options and return types |
| [docs/api/detector.md](docs/api/detector.md) | Reference for the `detector` plugin factory, including available plugins and their configuration options |
| [docs/api/types.md](docs/api/types.md) | Complete TypeScript type definitions for all public interfaces and enumerations |
| [docs/plugins/recaptcha.md](docs/plugins/recaptcha.md) | Step-by-step guide for integrating the reCAPTCHA v3 plugin, including the required server-side verification endpoint |
| [docs/plugins/turnstile.md](docs/plugins/turnstile.md) | Step-by-step guide for integrating the Cloudflare Turnstile plugin |
| [docs/plugins/custom.md](docs/plugins/custom.md) | Guide for writing and registering your own custom verification plugins |
| [docs/detectors.md](docs/detectors.md) | Descriptions of every passive detector component, what it measures, and what signals it looks for |
| [docs/scoring.md](docs/scoring.md) | Explanation of how individual detector signals are weighted and combined into the final risk score |
| [docs/error-codes.md](docs/error-codes.md) | Full reference for every integrity code that can appear in `debug.integrityCodes` |


## Examples

A working vanilla JavaScript demo is available in the [`examples/vanilla-js/`](examples/vanilla-js/) directory. It shows how to call `analyze()`, render the result fields into the DOM, and use debug mode to inspect the raw signals.


## Error Codes Overview

Integrity codes are short numeric identifiers assigned to specific signals that fire during analysis. Each code maps to a particular category of browser behaviour. When a code fires, its associated weight is added to the cumulative risk score.

| Range | Category |
|-------|----------|
| 10.x | User-Agent string inconsistencies, such as mismatches between the UA string and detected browser capabilities |
| 11.x | Missing essential browser APIs that all real browsers expose but headless environments often omit |
| 20.x | Navigation timing anomalies, including suspiciously fast page loads or missing timing entries |


See [docs/error-codes.md](docs/error-codes.md) for the full code-by-code reference including individual weights and recommended response actions.


## Browser Support

TrueHuman supports all modern versions of Chrome, Firefox, Safari, and Edge. The library requires an ES2017 or later environment because it uses `async/await` syntax internally. All browser APIs used by the detectors are stable and widely available across current browser versions. No polyfills are required for supported targets.


## Development

The following npm scripts are available for building and testing the library locally:

```bash
npm run build      # Compiles the source into dist/ in UMD, ESM, and CJS formats
npm test           # Runs the test suite using Vitest
npm run typecheck  # Runs the TypeScript compiler in check-only mode with tsc --noEmit
```


## License

TrueHuman is licensed under **GPL-3.0**. Copyright © [Hemanta Gayen](https://github.com/hemanta-gayen).