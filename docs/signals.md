# Signals

Every detection result is expressed as a signal code — either a number or a dotted-string. Codes are grouped by category and produced by specific detectors.

## Code Registry

All codes are defined in `src/types/index.ts` (the `EXACT` map and pattern matchers).

### Automation

| Code | Detector | Description | Risk Delta |
|---|---|---|---|
| 41 | webdriver | `navigator.webdriver` is enabled | 35 |
| 42.1 | chrome-app | `chrome.app` runtime detected | 5 |
| 42.2 | postmessage | postMessage-based Function.toString override | 40 |
| 42.3 | function-tostring | Function.prototype.toString override | 40 |
| 42.4 | devtools | DevTools tab count mismatch (delta = 132/133) | 15 |
| 43.2 | screen | Window inner/outer/height equal (headless) | 25 |
| 43.4 | screen | Unusually small screen (< 350px) | 20 |
| 43.5.x | screen | Invalid screen dimensions or orientation mismatch | 20 |
| 44.2 | browser-flags | Non-Chrome browser inconsistency | 15 |
| 44.3 | browser-flags | Non-Chrome browser inconsistency | 15 |
| 44.4 | browser-flags | Fullscreen API without fullscreen state | 10 |
| 46 | browser-flags | `nods` attribute on document element | 20 |

### Browser Integrity

| Code | Detector | Description | Risk Delta |
|---|---|---|---|
| 10.1 | user-agent | Android WebView UA pattern | 15 |
| 10.2 | user-agent | Headless browser UA pattern | 20 |
| 10.3 | user-agent | Chrome UA with Firefox CSS feature | 20 |
| 10.4 | user-agent | Firefox UA with Chrome CSS feature | 20 |
| 11.1–11.9 | essential-apis | Missing essential DOM API | 10 |
| 20.1 | navigation | Performance navigation type 1 | 25 |
| 20.2 | navigation | Performance navigation type 2 | 25 |

### Integrity Codes

Integrity codes follow the pattern `{domain}.{prefix}.{index}`:

**Domains:**

| Domain | Detector | Properties |
|---|---|---|
| 30 | document | `hidden`, `hasFocus` |
| 31 | navigator | `vendor`, `platform`, `languages`, `webdriver`, `permissions`, `getUserMedia` |
| 32 | screen | `width`, `height`, `orientation` |
| 33 | date | `toString`, `getTimezoneOffset` |
| 34 | iframe-element | `src`, `srcdoc` |
| 35 | prototype | 10 prototype methods |

**Prefixes:**

| Prefix | Meaning | Risk Delta |
|---|---|---|
| .1 | Property has own descriptor | 5 |
| .2 | Getter is writable | 8 |
| .3 | Getter is not native | 15 |
| .4 | Value is not native | 15 |

**Example:** `31.3.4` = `navigator.webdriver` getter is non-native (domain 31, prefix 3, property index 4).

### Fingerprinting

| Code | Detector | Description | Risk Delta |
|---|---|---|---|
| 35.1 | prototype | WebGL vendor is VMware | 30 |
| 35.3.x | prototype | Prototype method is writable | 5 |
| 35.4.x | prototype | Prototype getter is non-native | 15 |
| 35.5.x | prototype | Prototype value is non-native | 15 |

| 47.1 | canvas | Canvas 2D context unavailable (blocked) | 25 |
| 47.2 | canvas | Canvas pixel data all zeros (noise injection) | 30 |

Prototype methods checked (indices 1–15):

| Index | Object | Method |
|---|---|---|
| 1 | `HTMLElement.prototype` | `offsetWidth` |
| 2 | `HTMLElement.prototype` | `offsetHeight` |
| 3 | `HTMLCanvasElement.prototype` | `toBlob` |
| 4 | `AudioBuffer.prototype` | `getChannelData` |
| 5 | `HTMLCanvasElement.prototype` | `toDataURL` |
| 6 | `BaseAudioContext.prototype` | `createAnalyser` |
| 7 | `WebGLRenderingContext.prototype` | `getExtension` |
| 8 | `WebGLRenderingContext.prototype` | `getParameter` |
| 9 | `CanvasRenderingContext2D.prototype` | `getImageData` |
| 10 | `WebGLRenderingContext.prototype` | `getSupportedExtensions` |
| 11 | `CanvasRenderingContext2D.prototype` | `fillText` |
| 12 | `CanvasRenderingContext2D.prototype` | `strokeText` |
| 13 | `CanvasRenderingContext2D.prototype` | `drawImage` |
| 14 | `Path2D.prototype` | `addPath` |
| 15 | `CanvasRenderingContext2D.prototype` | `fillRect` |

### Iframe Integrity

| Code | Detector | Description | Risk Delta |
|---|---|---|---|
| 50.x | comparison | Iframe comparison #X failed (values differ between iframe and parent) | 15 |

### Behavioral

| Code | Detector | Description | Risk Delta |
|---|---|---|---|
| 60.1 | storage | Page reloaded more than 5 times (2h TTL) | 5 |
| 60.2 | storage | localStorage is disabled or cleared | 3 |
| 60.3 | storage | localStorage access error | 8 |

### Error Codes

Runtime errors are pushed to the `errors` array. They use the block number:

| Code | Block |
|---|---|
| 0 | Iframe creation failed |
| 10 | User agent checks |
| 11 | Essential API checks |
| 20 | Navigation timing |
| 21 | Neural network |
| 30–35 | Integrity checks (per domain) |
| 40 | Automation checks |
| 43 | Screen heuristics |
| 47 | Canvas fingerprint |
