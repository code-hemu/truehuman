# Node.js / Server-Side

Truehuman is a **browser-only** library. It requires DOM APIs (`document`, `navigator`, `screen`, etc.) and will not work in Node.js directly.

## Use in SSR frameworks (Next.js, Remix)

```typescript
"use client"
import { analyze } from "truehuman"

export function BotCheck() {
  const result = typeof window !== "undefined" ? analyze() : null
  return <div>Visitor: {result?.visitor ?? "unknown"}</div>
}
```

## Server-side verification

For server-side use, the token-based plugins (reCAPTCHA, Turnstile) require a server endpoint. The client sends the token, and your server verifies it with Google or Cloudflare:

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
