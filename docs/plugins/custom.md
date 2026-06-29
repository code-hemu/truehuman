# Custom Plugins

Exprify's plugin system allows you to extend TrueHuman's detection capabilities by registering your own async or synchronous signal collectors. Custom plugins integrate seamlessly into the `analyze()` pipeline and contribute detection codes and structured values to the final result object alongside the built-in detectors.

## Plugin Interface

Every plugin must conform to the `Plugin` interface, which requires a unique `name` and an `fn` function that performs the detection work. The interface is fully typed and ships with TrueHuman's type exports.

```typescript
interface Plugin {
  name: string
  fn: PluginFn
}

type PluginFn = (context?: PluginContext) => PluginResult | Promise<PluginResult>

interface PluginContext {
  integritychecks: (string | number)[]
  errors: number[]
  visitor?: string
  environmentFlag?: boolean
}

interface PluginResult {
  codes?: (string | number)[]
  value?: unknown
  duration?: number
}
```

### Fields

**`name`**
A unique string identifier for the plugin. This value is used as the key under which the plugin's `value` output is stored in `result.components`. It should be lowercase, descriptive, and free of spaces - for example, `"geolocation"`, `"keyboard-timing"`, or `"battery-status"`.

**`fn`**
The detection function. It receives a `PluginContext` object containing the integrity codes and error codes accumulated so far by the built-in detectors, which you can use to make conditional decisions in your plugin logic. It must return either a `PluginResult` object or a `Promise` that resolves to one.

**`PluginContext.integritychecks`**
An array of all detection codes emitted by the built-in feather detectors before your plugin ran. Inspect this if your plugin's behavior should depend on what the built-in pass already found.

**`PluginContext.errors`**
An array of error codes produced by the built-in pass. Useful for detecting degraded environments before executing expensive custom checks.

**`PluginContext.visitor`**
The preliminary visitor classification (`"human"`, `"suspicious"`, or `"bot"`) computed from the built-in detectors before any plugins ran. Useful for deciding whether to skip expensive plugin checks when the visitor is already confidently classified.

**`PluginContext.environmentFlag`**
Whether the environment flag was triggered during the built-in pass. When `true`, it indicates the page may have been opened from the local filesystem or an unusual rendering context.

**`PluginResult.codes`**
An optional array of detection codes your plugin wants to contribute. These are appended to the session's integrity codes array and factored into the final score. Omit or return an empty array if your plugin gathered data but did not detect any suspicious signals.

**`PluginResult.value`**
Any structured data your plugin collected. This can be any serializable value - an object, array, boolean, or string. It is stored verbatim under `result.components[plugin.name]` and is accessible to consumers of the result.

**`PluginResult.duration`**
An optional number representing how long the plugin's detection logic took, in milliseconds. This field is informational and does not affect scoring.

## Example

The following plugin checks whether geolocation is available, requests the user's position, and emits a detection code if permission was denied or the API is unavailable.

```typescript
import { analyze, type Plugin, type PluginContext } from "truehuman"

const geolocationPlugin: Plugin = {
  name: "geolocation",

  fn: async (context?: PluginContext) => {
    if (!navigator.geolocation) {
      return { value: { supported: false }, codes: [] }
    }

    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 3000,
      })
    ).catch(() => null)

    if (!pos) {
      return { value: { supported: true, denied: true }, codes: [99.1] }
    }

    return { value: { lat: pos.coords.latitude, lng: pos.coords.longitude }, codes: [] }
  },
}

const result = await analyze({ plugins: [geolocationPlugin] })
console.log(result.components.geolocation)
// { lat: 22.5726, lng: 88.3639 }
```

When the plugin runs and permission is denied, code `99.1` is appended to the integrity codes array. When geolocation succeeds, the coordinates are stored under `result.components.geolocation` and no detection codes are emitted.

## Plugin Lifecycle

Understanding the order in which plugins execute helps you write plugins that interact correctly with built-in detection state.

1. `analyze()` is called and begins the built-in feathers pass, running all internal detectors in sequence.
2. Once the built-in pass completes, each registered plugin's `fn` is invoked sequentially, in the order the plugins were passed to `analyze()`.
3. Each plugin receives a `PluginContext` snapshot containing the integrity codes and errors accumulated by the built-in pass and all previously executed plugins.
4. Any `codes` returned by the plugin are appended to the session's integrity codes array and contribute to the final risk score.
5. Any `value` returned by the plugin is stored under `result.components[plugin.name]` in the result object.
6. If a plugin's `fn` throws an unhandled error at any point, TrueHuman automatically appends code `90.2` to the integrity codes array and continues execution. Your plugin will not crash the overall `analyze()` call.

## Error Code Conventions

Custom plugins must follow TrueHuman's numeric code namespace convention to avoid collisions with built-in detector codes.

- Reserve codes in the `92.x` through `99.x` range for your custom plugins. Codes outside this range are reserved for internal use and should not be emitted by plugins.
- Any new code your plugin emits must have a corresponding risk value registered in `lookup/codes.ts`. Without a registered entry, the code will be appended to the integrity array but contribute a risk of `0` to the final score.
- Infrastructure failures such as network errors, API timeouts, or browser API unavailability should use codes with a risk value of `0`. These indicate an inconclusive environment rather than detected bot behavior.
- Genuine detection signals - behaviors or conditions associated with non-human actors - should use codes with a risk value greater than `0`, proportional to the confidence level of the signal.

Keeping risk values accurate and proportional ensures that the aggregate score produced by `analyze()` remains meaningful when custom plugins are mixed with built-in detectors.