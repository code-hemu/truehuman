# Getting Started

TrueHuman is a lightweight, extensible browser-side library for distinguishing real human visitors from bots and automated traffic. It works by analyzing behavioral signals, environment integrity, and optional third-party challenge plugins to produce a unified risk assessment for each visitor.

## Install

Install TrueHuman via npm into your project:

```bash
npm install truehuman
```

This installs the latest stable release along with its TypeScript type definitions. TrueHuman has no required peer dependencies and works out of the box in any modern browser environment.

## CDN

If you are not using a bundler, you can load TrueHuman directly in the browser via a `<script>` tag using the unpkg CDN:

```html
<script src="https://unpkg.com/truehuman/dist/truehuman.min.js"></script>
```

Once loaded, the library exposes a global `truehuman` object on `window`, making `analyze` and `detector` available without any import statement. This is suitable for quick prototypes or environments where a build step is not practical.

## Basic Usage

The core of TrueHuman is the `analyze()` function. Call it on page load or at any point where you want to evaluate the current visitor. It synchronously inspects the browser environment and returns a result object containing a visitor classification, a numeric risk score, and a confidence level.

```typescript
import { analyze } from "truehuman"

const result = analyze()
console.log(result.visitor)       // "human" | "suspicious" | "bot"
console.log(result.risk.score)    // 0–100 (higher means more likely a bot)
console.log(result.confidence)    // 0–100 (higher means more certain)
```

### Result Fields

- **`result.visitor`** - A plain-English classification of the visitor. One of `"human"`, `"suspicious"`, or `"bot"`.
- **`result.risk.score`** - A numeric score from `0` to `100`. A score near `0` indicates a likely genuine human visitor; a score near `100` indicates a likely automated agent or bot.
- **`result.confidence`** - How certain TrueHuman is in its classification, expressed as a value from `0` to `100`. A low confidence score means the signals were ambiguous and the result should be treated with caution.

## With Plugins

TrueHuman supports an optional plugin system that integrates third-party bot detection challenges into the analysis pipeline. Plugins are asynchronous, so `analyze()` must be awaited when one or more plugins are provided.

The following example adds Google reCAPTCHA v3 as an additional verification layer:

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

### How Plugins Work

When plugins are supplied, TrueHuman runs its built-in environment analysis first, then executes each plugin in sequence. Each plugin contributes additional signals that are folded into the final `risk.score` and `visitor` classification. The `endpoint` option specifies your server-side route that receives the challenge token and performs backend verification, keeping your secret key out of the browser.

Multiple plugins can be combined in the `plugins` array and will all run before the final result is produced.

## Debug Mode

Passing the string `"debug"` to `analyze()` activates debug mode, which attaches a detailed `debug` object to the result. This is useful during development to understand exactly which signals TrueHuman detected and how they influenced the final assessment.

```typescript
const result = analyze("debug")
console.log(result.debug)
// {
//   integrityCodes: [...],      - list of integrity check codes that fired
//   iframeComparisons: N,       - number of iframe environment comparisons performed
//   environmentFlag: ...,       - overall environment flag value
//   errors: [...]               - any non-fatal errors encountered during analysis
// }
```

### Debug Fields

- **`integrityCodes`** - An array of internal code strings identifying which environment integrity checks triggered during analysis. Useful for understanding why a visitor was flagged.
- **`iframeComparisons`** - The number of iframe-based environment comparisons TrueHuman performed. These comparisons help detect inconsistencies that suggest a sandboxed or automated context.
- **`environmentFlag`** - A summarized flag representing the overall state of the detected browser environment.
- **`errors`** - A list of any non-fatal errors that occurred during analysis. TrueHuman is designed to degrade gracefully, so errors here do not prevent a result from being returned.

> Debug mode is intended for development and troubleshooting only. Avoid shipping it in production, as it exposes internal signal data that could help adversaries understand and evade detection.

## Next Steps

Once you have TrueHuman running, explore the following resources to go further:

- [API Reference](api/analyze.md) - Full documentation for `analyze()`, all available options, and the complete result object schema.
- [reCAPTCHA Plugin](plugins/recaptcha.md) - Step-by-step guide for integrating Google reCAPTCHA v3, including the required server-side verification endpoint.
- [Turnstile Plugin](plugins/turnstile.md) - Guide for integrating Cloudflare Turnstile as a privacy-friendly alternative to reCAPTCHA.
- [Error Codes](error-codes.md) - A full reference of all integrity codes and error identifiers that may appear in analysis results and debug output.