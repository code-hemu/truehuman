# React Example

```tsx
import { useEffect, useState } from "react"
import { analyze, type AnalyzeResult } from "truehuman"

export function useBotDetection() {
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setResult(analyze())
    setLoading(false)
  }, [])

  return { result, loading }
}
```

## With plugins

```tsx
import { useEffect, useState } from "react"
import { analyze, detector, type AnalyzeResult } from "truehuman"

export function useBotDetectionWithRecaptcha(siteKey: string) {
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const res = await analyze({
        plugins: [
          detector.grecaptcha({
            siteKey,
            endpoint: "/api/verify-recaptcha",
          }),
        ],
      })
      setResult(res)
      setLoading(false)
    })()
  }, [siteKey])

  return { result, loading }
}
```
