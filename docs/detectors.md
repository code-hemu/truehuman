# Detectors

Truehuman runs 20+ passive detectors during the feathers pass. Each detector checks a specific browser API or behavior for anomalies.

## Core integrity

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `essentialApis` | Essential APIs | `11.1`–`11.9` | `window.close`, `Notification`, `devicePixelRatio`, `documentElement`, `screenLeft`, `matchMedia`, `external.toString`, `Permissions`, `getAttributeNames` |
| `prototype` | Prototype integrity | `35.3`–`35.5` | Native getter/function integrity for 15 critical Web API methods |

## User-Agent & Navigator

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `userAgent` | UA consistency | `10.1`–`10.4` | Android WebView, headless patterns, engine mismatches across iframe |
| `navigator` | Navigator integrity | `31.x` | `vendor`, `webdriver`, `platform`, `languages`, `permissions`, `getUserMedia` across iframe |

## Automation detection

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `webDriver` | Automation flags | `41`, `42.1`–`42.4`, `44.2`–`44.4`, `46` | `navigator.webdriver`, `chrome.runtime`, Function.toString patching, DevTools, browser flags |
| `navigation` | Navigation timing | `20.1`, `20.2` | PerformanceNavigationTiming anomalies (zero durations, synthetic navigation) |

## Screen & Display

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `screen` | Screen integrity | `43.2`, `43.4`, `43.5` | Dimension equality, small screens, missing orientation |
| `screenMeta` | Screen heuristics | `43.2`, `43.4`, `43.5` | Abnormal display/viewport patterns |
| `forcedColors` | Forced colors | `81.1` | Windows High Contrast mode |
| `invertedColors` | Inverted colors | `82.1` | Accessibility color inversion |

## Graphics & Audio

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `canvas` | Canvas fingerprint | `47.1`–`47.3` | Context availability, winding support, pixel data (noise injection) |
| `webgl` | WebGL integrity | `50.x` (comparisons), `35.1` | Vendor/renderer consistency across iframe |
| `fonts` | Font enumeration | `70.1`, `70.2` | Available system font count |
| `fontPreferences` | Font preferences | `71.1` | System font and size preferences |
| `audioBaseLatency` | Audio latency | `85.1`, `85.2` | AudioContext.baseLatency value |

## Storage & Browser state

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `storage` | Storage availability | `60.1`–`60.3`, `61.1`, `62.1` | localStorage, sessionStorage, indexedDB availability and visit count |
| `plugins` | Plugin enumeration | `80.1` | navigator.plugins availability |

## Cross-frame comparisons

| Component | Detector | Codes | What it checks |
|-----------|----------|-------|----------------|
| `iframe` | Iframe element | `34.1`–`34.4`, `50.x` | src/srcdoc getter integrity, cross-frame property comparisons |
| `document` | Document integrity | `30.x` | hidden/hasFocus consistency across iframe |
| `timezone` | Date integrity | `33.x` | toString/getTimezoneOffset consistency across iframe |
