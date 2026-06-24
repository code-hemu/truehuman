# Detectors

TrueHuman runs 20+ passive detectors during the **features pass** - a lightweight, non-blocking scan that executes silently in the background as soon as the library initializes. Each detector targets a specific browser API, property, or behavioral pattern and checks it for anomalies that are statistically associated with automated environments, headless browsers, or spoofed runtimes.

Detectors are grouped into functional categories based on what layer of the browser environment they inspect. Each detector emits one or more numeric signal codes when an anomaly is found. These codes feed into the TrueHuman scoring model to produce the final bot probability.

No detector alone is conclusive. TrueHuman correlates signals across all detectors to distinguish genuine anomalies from edge-case real-user configurations.

## Core Integrity

These detectors verify that fundamental browser APIs exist, behave correctly, and have not been tampered with. Bots and automation frameworks frequently override or delete native globals, and even subtle deviations from expected behavior are flagged.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `essentialApis` | Essential APIs | `11.1` to `11.9` | Validates presence and behavior of nine critical globals: `window.close`, `Notification`, `devicePixelRatio`, `documentElement`, `screenLeft`, `matchMedia`, `external.toString`, `Permissions`, and `getAttributeNames`. Missing or non-native implementations are flagged. |
| `prototype` | Prototype integrity | `35.3` to `35.5` | Checks that native getters and methods on 15 critical Web API interfaces have not been patched, wrapped, or replaced. Automation tools often modify native prototypes to intercept calls or suppress detection. |


## User-Agent and Navigator

These detectors validate the consistency and authenticity of the browser's self-reported identity. A real browser exposes a coherent set of UA-related properties that all agree with one another. Automation tools frequently spoof individual properties without updating the full set, creating detectable contradictions.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `userAgent` | UA consistency | `10.1` to `10.4` | Scans the user agent string for Android WebView markers, headless browser signatures, and engine mismatches. Also compares the UA reported in the main frame against the one visible inside a sandboxed iframe to detect spoofing at one layer. |
| `navigator` | Navigator integrity | `31.x` | Inspects `vendor`, `webdriver`, `platform`, `languages`, `permissions`, and `getUserMedia` for inconsistencies and missing values. Cross-frame comparison ensures that these properties are consistent between the main document context and an isolated iframe environment. |


## Automation Detection

These detectors look for direct evidence of browser automation. Headless browsers, WebDriver-controlled instances, and instrumented Chromium builds expose a range of flags and artifacts that are not present in ordinary user-driven browsers.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `webDriver` | Automation flags | `41`, `42.1` to `42.4`, `44.2` to `44.4`, `46` | Checks `navigator.webdriver` for a truthy value, inspects `chrome.runtime` for automation artifacts, detects `Function.toString` patching used by stealth plugins, and identifies DevTools presence and known headless browser launch flags in the environment. |
| `navigation` | Navigation timing | `20.1`, `20.2` | Reads `PerformanceNavigationTiming` entries and flags anomalous values such as zero-duration loading phases or synthetic navigation events that do not match patterns produced by real page loads driven by a human. |


## Screen and Display

These detectors examine the reported screen dimensions, viewport geometry, and display-related media features. Real devices have natural variation in screen configurations. Headless and virtualized environments frequently expose implausible or uniform values.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `screen` | Screen integrity | `43.2`, `43.4`, `43.5` | Checks for exact equality between screen width and height (suggesting a virtual square display), unusually small screen dimensions inconsistent with real devices, and a missing or null `screen.orientation` object. |
| `screenMeta` | Screen heuristics | `43.2`, `43.4`, `43.5` | Applies higher-level heuristics to the combination of display size, device pixel ratio, and viewport dimensions to identify configurations that are statistically implausible for real user devices. |
| `forcedColors` | Forced colors | `81.1` | Detects Windows High Contrast mode via the `forced-colors` CSS media feature. While not inherently a bot signal, this flag contributes to the overall environmental fingerprint used for consistency scoring. |
| `invertedColors` | Inverted colors | `82.1` | Detects accessibility color inversion via the `inverted-colors` media feature. Similar to forced colors, this is used as a supplementary environmental signal rather than a direct bot indicator. |


## Graphics and Audio

These detectors probe the graphics pipeline and audio subsystem for evidence of virtualization, noise injection, or missing hardware acceleration. Real devices produce distinctive outputs from canvas rendering and WebGL queries. Headless browsers either omit these subsystems entirely or produce outputs that differ from hardware-backed rendering.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `canvas` | Canvas fingerprint | `47.1` to `47.3` | Verifies that a 2D canvas context is available, that the `evenodd` winding rule is supported, and that pixel data extracted from a rendered scene does not show evidence of deliberate noise injection commonly used by anti-fingerprinting tools to randomize canvas output. |
| `webgl` | WebGL integrity | `50.x`, `35.1` | Reads the WebGL `VENDOR` and `RENDERER` strings and compares them across the main frame and an iframe to detect spoofing. Also checks that the WebGL prototype chain has not been tampered with. |
| `fonts` | Font enumeration | `70.1`, `70.2` | Measures the number of system fonts detectable through layout-based enumeration. Headless and minimal container environments typically expose far fewer fonts than real operating system installations. |
| `fontPreferences` | Font preferences | `71.1` | Checks the system default font family and base font size as configured in the browser or OS. These preferences vary across real user environments and are rarely configured in automated setups. |
| `audioBaseLatency` | Audio latency | `85.1`, `85.2` | Reads `AudioContext.baseLatency` and flags values that fall outside the range produced by real audio hardware. Virtualized and headless environments often report zero, null, or implausibly low latency values. |


## Storage and Browser State

These detectors verify that standard browser storage mechanisms are available and that they reflect a plausible browsing history. Automated environments frequently launch with storage disabled, cleared, or operating in a private mode that leaves no persistent state.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `storage` | Storage availability | `60.1` to `60.3`, `61.1`, `62.1` | Confirms that `localStorage`, `sessionStorage`, and `indexedDB` are accessible and functional. Also reads a visit counter persisted in storage to detect first-ever visits, which are disproportionately common in bot traffic that launches fresh browser profiles for each request. |
| `plugins` | Plugin enumeration | `80.1` | Checks that `navigator.plugins` is present and non-empty. Real desktop browsers typically expose at least one plugin entry. Headless Chromium and many automation frameworks expose an empty plugins list by default. |


## Cross-Frame Comparisons

These detectors create an isolated iframe and compare key browser properties between the main frame and the sandboxed child context. A real browser produces consistent values across both frames. Automation tools and stealth patches often modify the top-level frame without applying the same changes inside iframes, creating detectable inconsistencies.

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `iframe` | Iframe element | `34.1` to `34.4`, `50.x` | Validates that the `src` and `srcdoc` attribute getters on the iframe element are native and unpatched. Also compares WebGL and other environment properties between the main frame and the sandboxed iframe to surface cross-context discrepancies. |
| `document` | Document integrity | `30.x` | Compares `document.hidden` and `document.hasFocus()` between the parent document and the iframe. Inconsistencies in these values indicate that the page lifecycle is being simulated rather than driven by genuine user interaction in a real browser window. |
| `timezone` | Date integrity | `33.x` | Compares `Date.prototype.toString` output and `getTimezoneOffset()` values between the main frame and the iframe. Timezone spoofing tools sometimes patch these at one frame level without updating the other, producing detectable mismatches. |