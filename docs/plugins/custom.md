# Custom Plugins

You can write your own plugin to add custom detection signals.

## Plugin interface

```typescript
interface Plugin {
  name: string
  fn: PluginFn
}

type PluginFn = (context?: PluginContext) => PluginResult | Promise<PluginResult>

interface PluginContext {
  integritychecks: (string | number)[]
  errors: number[]
}

interface PluginResult {
  codes?: (string | number)[]
  value?: unknown
  duration?: number
}
```

## Example

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
```

## Plugin lifecycle

1. `analyze()` runs all built-in detectors first (feathers pass)
2. Each plugin's `fn` is called sequentially with `PluginContext`
3. Returned `codes` are appended to the integrity codes array
4. Returned `value` is stored under `components[plugin.name]` in the result
5. If `fn` throws, code `90.2` is appended automatically

## Error code conventions

- Use codes in the `92.x`–`99.x` range for custom plugins
- Risk values for new codes must be registered in `lookup/codes.ts`
- Infrastructure errors (network, timeout, API down) should have risk 0
- Detection signals (bot-like behavior) should have risk > 0
