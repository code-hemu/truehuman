# Node.js / Server-Side

Truehuman is a **browser-only** library. It relies entirely on browser-native APIs including `document`, `navigator`, `screen`, `window`, and other DOM globals that are not available in Node.js or any other server-side JavaScript runtime. Attempting to import and call Truehuman functions directly in a Node.js process will result in reference errors or silently incorrect behavior.

This page explains how to safely use Truehuman in server-side rendering (SSR) frameworks and how to integrate server-side token verification for reCAPTCHA and Cloudflare Turnstile plugins.

## Use in SSR Frameworks (Next.js, Remix)

In frameworks like Next.js and Remix, components may render on the server before being hydrated in the browser. Since Truehuman depends on browser globals, it must be guarded against server-side execution using an environment check.

The `typeof window !== "undefined"` pattern is the standard way to ensure browser-only code does not run during server-side rendering. In Next.js App Router, you should also mark the component with the `"use client"` directive so the component is treated as a client component and hydrated on the browser.

```typescript
"use client"
import { analyze } from "truehuman"

export function BotCheck() {
  const result = typeof window !== "undefined" ? analyze() : null
  return <div>Visitor: {result?.visitor ?? "unknown"}</div>
}
```

When the component renders on the server, `window` is undefined and `analyze()` is never called, so `result` is `null` and the fallback `"unknown"` is displayed. Once the component hydrates in the browser, `analyze()` runs normally and populates the visitor classification.

If you are using Remix, the same guard applies inside `useEffect` or in components that are explicitly client-side. For Next.js Pages Router, you can use `dynamic` with `{ ssr: false }` to skip server rendering entirely for a component that uses Truehuman:

```typescript
import dynamic from "next/dynamic"

const BotCheck = dynamic(() => import("./BotCheck"), { ssr: false })
```

This approach is the simplest way to guarantee Truehuman is never imported or executed in a server context.

## Server-Side Verification

When using token-based plugins such as reCAPTCHA v3 or Cloudflare Turnstile, Truehuman collects a token from the browser and returns it as part of the analysis result. This token cannot be verified client-side. Verification must happen on your backend, where your secret key is kept private and the token is sent to the corresponding third-party verification endpoint.

The general flow works as follows. The browser runs `analyze()`, which internally calls the reCAPTCHA or Turnstile widget and retrieves a short-lived token. Your application sends this token to your own server endpoint. The server endpoint forwards the token along with your secret key to Google or Cloudflare, receives a verification response including a risk score, and returns that result to the client or uses it to make an access control decision.

The example below shows a Next.js App Router API route that verifies a reCAPTCHA v3 token:

```typescript
// Server endpoint (Next.js API route, Express, etc.)
export async function POST(request: Request) {
  const { token } = await request.json()

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    }
  )

  const data = await response.json()
  return Response.json({ success: data.success, score: data.score })
}
```

The `score` field returned by reCAPTCHA v3 is a float between `0.0` and `1.0`, where scores closer to `1.0` indicate a likely human and scores closer to `0.0` indicate a likely bot. A common threshold for blocking requests is `0.5`, though the appropriate value depends on the sensitivity of the action being protected.

For Cloudflare Turnstile, the server verification endpoint differs:

```typescript
export async function POST(request: Request) {
  const { token } = await request.json()

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    }
  )

  const data = await response.json()
  return Response.json({ success: data.success })
}
```

Turnstile returns a boolean `success` field rather than a numeric score. If `success` is `true`, the challenge was passed. If `false`, the request should be treated as suspicious and denied or challenged further.

In both cases, your secret key must be stored in a server-side environment variable and must never be exposed to the browser or included in client-side code.