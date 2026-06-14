# Scoring

## Overview

The scoring system converts raw signal codes into a confidence-based verdict. All scoring logic is in `src/scoring/risk.ts` and `src/scoring/confidence.ts`.

## Components

### `riskScore` (0–100)

Computed from triggered signals:

- **Base**: sum of all triggered signal `riskDelta` values
- **Error penalty**: `+8` per runtime error, capped at `+20`
- **Environment flag**: `+30` if direct file open detected
- **Cross-category bonus**: `+5` for each additional category beyond the first
- **Cap**: `min(riskScore, 100)`

### `confidence` (0–100)

```
confidence = 100 - riskScore
```

Rounded to 2 decimal places.

### `verdict`

| riskScore | Verdict |
|---|---|
| 0–15 | `human` |
| 16–50 | `suspicious` |
| 51–100 | `bot` |

### `riskLevel`

| riskScore | Level |
|---|---|
| 0–15 | `low` |
| 16–40 | `medium` |
| 41–70 | `high` |
| 71–100 | `critical` |

### Per-check status

| Condition | Status |
|---|---|
| 0 signals in category | `pass` |
| total riskDelta ≤ 30 | `suspicious` |
| total riskDelta > 30 | `fail` |

## Signal Risk Deltas

| Code range | Risk Delta | Notes |
|---|---|---|
| 10.x (UA) | 15–20 | |
| 11.x (APIs) | 10 | |
| 20.x (navigation) | 25 | |
| 30.x–33.x (descriptor 1.x) | 5 | Own property descriptor exists |
| 30.x–33.x (descriptor 2.x) | 8 | Getter is writable |
| 30.x–33.x (descriptor 3.x–4.x) | 15 | Getter/value is non-native |
| 34.x (iframe descriptor) | 5–15 | Same pattern as above |
| 35.1 (VMware WebGL) | 30 |
| 47.x (canvas) | 25–30 | |
| 35.3–35.5 (prototype) | 5–15 | Same pattern as above |
| 41 (webdriver) | 35 | |
| 42.1 (chrome.app) | 5 | Low — fires on real Chrome |
| 42.2–42.3 (Function.toString) | 40 | |
| 42.4 (DevTools) | 15 | |
| 43.x (screen) | 20–25 | |
| 44.x (browser flags) | 10–15 | |
| 46 (nods) | 20 | |
| 50.x (comparison) | 15 | Per failed comparison |
| 60.x (storage) | 3–8 | |

## Examples

### Clean browser (no signals)
```
riskScore = 0
confidence = 100
verdict = "human"
riskLevel = "low"
checks: all pass
```

### Storage signal only (page reloaded >5 times)
```
code 60.1 → riskDelta +5
riskScore = 5
confidence = 95
verdict = "human"
riskLevel = "low"
checks: behavioral → suspicious (5)
```

### Multiple automation signals
```
code 41 (webdriver) → +35
code 43.2 (screen)  → +25
2 categories        → +5
riskScore = 65
confidence = 35
verdict = "bot"
riskLevel = "high"
```
