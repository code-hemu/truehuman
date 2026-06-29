# Error Codes

A comprehensive reference for all detection signal codes emitted by the bot-detection engine. Each code identifies a specific signal or test failure, carries a risk score, and belongs to a named detector module. These codes are collected during a browser inspection session and combined to produce an overall suspicion score.

## Code Structure

Error codes follow one of three structural patterns depending on the type of signal they represent:

- **`domain.group.prop`** - A three-part dotted code used for iframe comparison failures and dynamic integrity checks, where the domain identifies the category, the group identifies the check type, and the prop identifies the specific property being tested. Example: `30.3.1`
- **`domain.prop`** - A two-part code used for specific, named detection signals within a category. Example: `10.2`
- **Single number** - A standalone integer code used for broad, standalone signals that do not belong to a sub-group. Example: `41`

## Risk Levels

Each code is assigned a numeric risk value representing how strongly that signal contributes to the suspicion that the client is automated or non-human. Risk values accumulate across all detected codes to produce a final score.

| Risk | Meaning |
|------|---------|
| 0 | Infrastructure error - the signal indicates a service failure, not bot evidence |
| 1–15 | Minor signal - weakly contributes to overall suspicion |
| 20–30 | Moderate signal - suggests possible automation or unusual environment |
| 30–40 | Strong signal - high confidence indicator of bot or headless browser |

## Full Code Table

### User-Agent Signals (10.x)

These codes are emitted when the browser's `User-Agent` string contains patterns inconsistent with a genuine human-operated browser, or when the declared UA conflicts with CSS feature support detected independently.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 10.1 | user-agent | 15 | UA string matches the pattern of an Android WebView environment rather than a standalone browser |
| 10.2 | user-agent | 20 | UA string identifies a known headless browser such as HeadlessChrome |
| 10.3 | user-agent | 20 | UA claims to be Chrome, but Firefox-specific CSS features are detected in the environment |
| 10.4 | user-agent | 20 | UA claims to be Firefox, but Chrome-specific CSS features are detected in the environment |

### Essential APIs (11.x)

These codes are emitted when APIs that are universally present in all real, consumer-grade browsers are missing, malformed, or inaccessible. Missing essential APIs are a strong signal of a stripped-down or emulated environment.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 11.1 | essential-apis | 10 | `window.close` is absent - expected on all browser windows |
| 11.2 | essential-apis | 10 | `Notification` API is missing - absent even in environments where permissions would deny it |
| 11.3 | essential-apis | 10 | `window.devicePixelRatio` is undefined or inaccessible |
| 11.4 | essential-apis | 10 | `document.documentElement` is null or missing |
| 11.5 | essential-apis | 10 | `window.screenLeft` or `window.screenTop` is missing - these are set by the OS window manager |
| 11.6 | essential-apis | 10 | `window.matchMedia` is absent or returns malformed results |
| 11.7 | essential-apis | 10 | `window.external.toString()` does not return the expected native code string |
| 11.8 | essential-apis | 10 | `navigator.permissions.query` is absent or does not behave as a native function |
| 11.9 | essential-apis | 10 | `Element.getAttributeNames` is missing from the DOM prototype |

### Navigation (20.x)

These codes relate to the `PerformanceNavigation` type recorded by the browser, which describes how the current page was reached. Certain navigation types are unusual for a first visit in a real session.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 20.1 | navigation | 25 | Navigation type is `1` (page reload) - suspicious on an initial page load |
| 20.2 | navigation | 25 | Navigation type is `2` (back/forward cache) - unusual for a fresh session entry |

### Navigator Integrity (31.x)

These dynamic codes are generated when property getters on the `navigator` object are found to be non-native - meaning they have been overridden or proxied by automation tooling. The third segment identifies which specific property failed the check.

**Property index map:** `1` = vendor, `2` = platform, `3` = languages, `4` = webdriver flag, `5` = permissions, `6` = getUserMedia

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 31.3.1 | navigator | 15 | `navigator.vendor` getter is not a native browser implementation |
| 31.3.2 | navigator | 15 | `navigator.platform` getter is not a native browser implementation |
| 31.3.3 | navigator | 15 | `navigator.languages` getter is not a native browser implementation |
| 31.3.4 | navigator | 15 | `navigator.webdriver` getter is not a native browser implementation |
| 31.3.5 | navigator | 15 | `navigator.permissions` getter is not a native browser implementation |
| 31.3.6 | navigator | 15 | `navigator.getUserMedia` getter is not a native browser implementation |

### Screen Integrity (32.x)

These dynamic codes fire when property getters on the `screen` object have been replaced with non-native implementations, typically to fake or hide the true screen dimensions of the environment.

**Property index map:** `1` = width, `2` = height, `3` = orientation

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 32.3.1 | screen | 15 | `screen.width` getter is overridden and not a native browser function |
| 32.3.2 | screen | 15 | `screen.height` getter is overridden and not a native browser function |
| 32.3.3 | screen | 15 | `screen.orientation` getter is overridden and not a native browser function |

### Date Integrity (33.x)

These codes fire when `Date` prototype methods have been replaced with non-native implementations, commonly done to spoof timezone offsets or disguise the environment.

**Property index map:** `1` = toString, `2` = getTimezoneOffset

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 33.3.1 | date | 15 | `Date.prototype.toString` is overridden and not a native browser function |
| 33.3.2 | date | 15 | `Date.prototype.getTimezoneOffset` is overridden and not a native browser function |

### Iframe Element (34.x)

These codes fire when property getters on HTMLIFrameElement have been replaced, which can indicate an attempt to intercept or spoof iframe inspection routines.

**Property index map:** `1` = src, `2` = srcdoc

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 34.3.1 | iframe-element | 15 | `HTMLIFrameElement.src` getter is overridden and not a native implementation |
| 34.3.2 | iframe-element | 15 | `HTMLIFrameElement.srcdoc` getter is overridden and not a native implementation |

### Prototype & WebGL (35.x)

This group covers both prototype integrity checks and WebGL renderer checks. Non-native prototype methods indicate tampering with core JavaScript objects, while a VMware WebGL vendor is a strong indicator of a virtual machine environment.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 35.1 | webgl | 30 | WebGL unmasked vendor string is `VMware` - indicates a virtual machine renderer |
| 35.3 | prototype | 15 | A core prototype method (check #3) is not a native implementation |
| 35.4 | prototype | 15 | A core prototype method (check #4) is not a native implementation |
| 35.5 | prototype | 15 | A core prototype method (check #5) is not a native implementation |

### WebDriver and Automation (40.x–46)

This group covers direct webdriver detection, extension signals, `Function.toString` integrity, and miscellaneous browser-flag anomalies that are characteristic of automated or instrumented browsers.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 41 | webdriver | 35 | `navigator.webdriver` is `true` - the browser was launched with automation flags |
| 42.1 | chrome-app | 5 | `chrome.runtime` is present - indicates a Chrome extension may be active |
| 42.2 | postmessage | 40 | `Function.toString` has been overridden via a postMessage-based injection mechanism |
| 42.3 | function-tostring | 40 | `Function.prototype.toString` has been directly replaced with a non-native implementation |
| 42.4 | devtools | 5 | The number of open DevTools tabs does not match what the environment reports |
| 44.2 | browser-flags | 15 | Browser inconsistency detected that is not consistent with Chrome's expected flag set |
| 44.3 | browser-flags | 15 | Secondary non-Chrome browser flag inconsistency detected |
| 44.4 | browser-flags | 10 | The Fullscreen API is present but the environment reports no fullscreen state is active |
| 46 | browser-flags | 20 | The `nods` attribute is present on the document root element - a known automation artifact |

### Screen Heuristics (43.x)

These codes are emitted when the screen or window dimensions report values that are implausible or characteristic of a headless rendering environment with no physical display.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 43.2 | screen | 25 | The inner window width and height are equal to the screen dimensions - a common headless browser artifact |
| 43.4 | screen | 20 | The reported screen dimensions are unusually small, suggesting a virtual or minimal display |
| 43.5 | screen | 20 | Screen dimensions are invalid, absent, or the orientation object is missing entirely |

### Canvas (47.x)

Canvas fingerprinting is a standard browser identification technique. These codes fire when the canvas API is unavailable, behaves incorrectly, or returns pixel data that has been deliberately zeroed out by a noise-injection countermeasure.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 47.1 | canvas | 25 | The Canvas 2D rendering context is unavailable - likely blocked by a privacy extension or headless configuration |
| 47.2 | canvas | 20 | The canvas winding rule (`evenodd`) is not supported, indicating an incomplete rendering implementation |
| 47.3 | canvas | 30 | All pixel values returned by `getImageData` are zero - indicates active noise injection to defeat fingerprinting |

### Iframe Comparisons (50.x)

These codes are generated dynamically when values measured inside a sandboxed iframe differ from values measured in the main window. Such mismatches indicate that the outer environment has been patched or spoofed while the iframe retained native values, a common artifact of automation frameworks that hook the top-level page only.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 50.1 | comparison | 15 | Iframe comparison check #1 produced a mismatch between main frame and iframe values |
| 50.2 | comparison | 15 | Iframe comparison check #2 produced a mismatch between main frame and iframe values |
| 50.x | comparison | 15 | Iframe comparison check #X produced a mismatch - the index corresponds to the specific property tested |

### Storage (60.x–62.x)

These codes cover the availability and behavior of browser storage APIs. While individual storage failures carry low risk, multiple storage-related signals together can indicate a constrained or sandboxed environment.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 60.1 | storage | 5 | The page has been reloaded more than 5 times in the current session - unusual for genuine human navigation |
| 60.2 | storage | 3 | `localStorage` is disabled, absent, or was cleared between visits |
| 60.3 | storage | 8 | Accessing `localStorage` threw an exception - may indicate a sandboxed context |
| 61.1 | storage | 3 | `sessionStorage` is unavailable in the current context |
| 62.1 | storage | 3 | `indexedDB` is unavailable or blocked in the current context |

### Fonts (70.x–71.x)

Font availability is used as an indirect fingerprinting signal. Headless environments typically have very few installed fonts, and font enumeration failures indicate a restricted rendering environment.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 70.1 | fonts | 5 | The number of detectable system fonts is below a threshold expected for a real operating system installation |
| 70.2 | fonts | 20 | Font detection failed entirely or was blocked - the font measurement API returned no usable data |
| 71.1 | font-preferences | 15 | Font preference metrics such as default serif or monospace measurements returned abnormal or zero values |

### Plugins (80.x)

Browser plugin enumeration provides a weak but useful signal. Real browsers typically expose at least a minimal plugin list, while headless environments often suppress this entirely.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 80.1 | plugins | 10 | `navigator.plugins` is unavailable, empty, or blocked from enumeration |

### Colors (81.x–82.x)

These codes fire when OS-level color accessibility modes are active. While these are legitimate user preferences, they represent rare environmental configurations that contribute weakly to overall suspicion profiling.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 81.1 | forced-colors | 5 | The OS forced-colors accessibility mode is active, overriding the page's color scheme |
| 82.1 | inverted-colors | 5 | The OS inverted-colors accessibility mode is active |

### Audio (85.x)

The Web Audio API provides an `AudioContext.baseLatency` value that is influenced by the hardware audio stack. Missing or invalid latency values indicate a virtual audio environment or a context created without real audio hardware.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 85.1 | audio-base-latency | 2 | `AudioContext` could not be created - the Web Audio API is unavailable in this environment |
| 85.2 | audio-base-latency | 4 | `AudioContext.baseLatency` is `null`, `undefined`, or a non-finite value such as `NaN` |
| 85.3 | audio-base-latency | 5 | `new AudioContext()` constructor threw an exception |
| 85.4 | audio-base-latency | 2 | `AudioContext.baseLatency` value is ≤ 0 or > 1, indicating an unusual audio environment |

### reCAPTCHA (90.x)

These codes reflect the outcome of a Google reCAPTCHA v3 verification. Codes with risk `0` represent infrastructure failures rather than bot evidence and should not contribute to suspicion scoring.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 90.1 | recaptcha-score | 25 | The reCAPTCHA v3 score returned by Google fell below the configured suspicion threshold |
| 90.2 | recaptcha-api | 0 | The reCAPTCHA API was unreachable - this is an infrastructure error, not a bot signal |
| 90.3 | recaptcha-rejected | 0 | The reCAPTCHA token was rejected by the verification endpoint - infrastructure failure, not a bot signal |

### Turnstile (91.x)

These codes reflect the outcome of a Cloudflare Turnstile verification challenge.

| Code | Detector | Risk | Description |
|------|----------|------|-------------|
| 91.1 | turnstile-fail | 25 | Cloudflare Turnstile verification failed - the client did not pass the challenge |
| 91.2 | turnstile-api | 0 | The Turnstile API was unreachable - this is an infrastructure error, not a bot signal |

## Dynamic Three-Part Codes

Three-part codes in the format `domain.prefix.index` are generated at runtime based on which specific properties are tested and what type of anomaly is detected. The domain identifies the broad category, the prefix encodes what kind of non-native behavior was found, and the index identifies the specific property within that category.

### Domain Reference

| Domain | Category |
|--------|----------|
| 30 | Document properties |
| 31 | Navigator properties |
| 32 | Screen properties |
| 33 | Date prototype methods |
| 34 | Iframe element properties |
| 35 | Core prototype methods |

### Prefix Reference

| Prefix | Meaning | Risk |
|--------|---------|------|
| 1 | Property has a descriptor that should not exist | variable |
| 2 | Property getter is writable when it should be read-only | variable |
| 3 | Property getter is not a native browser implementation | 15 |
| 4 | Property value is not a native browser implementation | 15 |

### Examples

| Code | Meaning |
|------|---------|
| `30.3.1` | Document property #1 (`hidden`) has a non-native getter |
| `31.3.4` | Navigator property #4 (`webdriver`) has a non-native getter |
| `32.3.2` | Screen property #2 (`height`) has a non-native getter |
| `33.3.2` | Date method #2 (`getTimezoneOffset`) has a non-native getter |
| `34.3.1` | Iframe property #1 (`src`) has a non-native getter |
| `35.4.1` | Prototype method #1 under check group 4 has a non-native getter |