# detector API

The `detector` object contains factory functions that create plugins for use with `analyze({ plugins: [...] })`.

```typescript
import { detector } from "truehuman"
```

## `detector.grecaptcha(options)`

Creates a Google reCAPTCHA v3 plugin.

```typescript
detector.grecaptcha({
  siteKey: string
  action?: string                         // default "submit"
  endpoint: string                        // POSTs { token, action } here
  threshold?: number                      // default 0.5
  referrer?: "direct" | "internal" | "external"
  saveTokens?: boolean                    // default false — skip if feathers flagged
}): Plugin
```

See [reCAPTCHA Plugin](../plugins/recaptcha.md) for details.

## `detector.turnstile(options)`

Creates a Cloudflare Turnstile plugin.

```typescript
detector.turnstile({
  siteKey: string
  endpoint: string                        // POSTs { token } here
  referrer?: "direct" | "internal" | "external"
  appearance?: "always" | "execute" | "interaction-only"  // default "interaction-only"
}): Plugin
```

See [Turnstile Plugin](../plugins/turnstile.md) for details.
