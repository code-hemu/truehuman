# Hardware Profiler Plugin

The Hardware Profiler plugin reads `navigator.hardwareConcurrency` (CPU cores) and `navigator.deviceMemory` (RAM in GB) to detect hardware profiles that strongly correlate with virtualized environments and bot farms. It is completely passive — no network requests, no user prompts, no third-party dependencies.

Bot farms commonly run in VMs with standardized hardware configurations. A profile of exactly 2 CPU cores and 8 GB of RAM is a near-universal VM default that almost never appears on real consumer devices.

## Usage

```typescript
import { analyze, detector } from "truehuman"

const result = await analyze({
  plugins: [detector.hardware()],
})

console.log(result.components.hardware)
// { hardwareConcurrency: 8, deviceMemory: 16, profile: "high-end" }
```

## Profile Classification

The plugin classifies the hardware profile into one of four categories:

| Profile | Condition | Interpretation |
|---------|-----------|---------------|
| `"unknown"` | `hardwareConcurrency` is `null` | API missing — stripped or non-browser environment |
| `"vm-like"` | `hardwareConcurrency ≤ 2` and `deviceMemory === 8` | Suspicious — matches common VM defaults |
| `"low-end"` | `hardwareConcurrency ≤ 4` and `deviceMemory ≤ 4` or absent | Budget device or constrained container |
| `"mid-range"` | Everything else | Typical consumer device |
| `"high-end"` | `hardwareConcurrency ≥ 8` and `deviceMemory ≥ 8` | Powerful workstation or gaming machine |

## API Availability

| API | Chrome/Edge | Firefox | Safari |
|-----|------------|---------|--------|
| `navigator.hardwareConcurrency` | ✅ | ✅ | ✅ |
| `navigator.deviceMemory` | ✅ | ❌ | ❌ |

Missing `deviceMemory` (Firefox/Safari) does not trigger any error code — it is treated as a normal absence and the profile is classified based on `hardwareConcurrency` alone.

## Error Codes

| Code | Risk | Condition |
|------|------|-----------|
| `92.1` | **15** | `navigator.hardwareConcurrency` is missing entirely |
| `92.2` | **10** | Hardware profile classified as `"vm-like"` |

Code `92.1` carries risk 15 because a missing `hardwareConcurrency` API in any modern browser is a strong indicator of a non-standard or stripped runtime. Code `92.2` carries risk 10 — a VM-like profile is suspicious but not definitive on its own.

## Result Value

```typescript
{
  hardwareConcurrency: number | null,
  deviceMemory: number | null,
  profile: "unknown" | "low-end" | "mid-range" | "high-end" | "vm-like"
}
```
