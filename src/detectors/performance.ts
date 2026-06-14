import type { SignalResult } from "../types/index.js"

export function detectPerformance(): SignalResult {
  const details: Record<string, unknown> = {}
  let suspicious = false
  let riskDelta = 0

  if (typeof performance === "undefined") {
    return {
      name: "performance",
      detected: false,
      suspicious: false,
      weight: 0,
      riskDelta: 0,
    }
  }

  try {
    const entries = performance.getEntriesByType("navigation")
    if (entries && entries.length > 0) {
      const nav = entries[0] as PerformanceNavigationTiming

      if (nav.type === "navigate") {
        if (
          nav.duration === 0 &&
          nav.transferSize === 0 &&
          nav.domComplete === 0 &&
          (nav.fetchStart !== 0 || nav.secureConnectionStart !== 0)
        ) {
          suspicious = true
          riskDelta = 8
          details.zeroNavigationTiming = true
        }

        if (
          nav.connectEnd === nav.connectStart &&
          nav.responseEnd === nav.responseStart &&
          nav.loadEventEnd === nav.loadEventStart &&
          nav.domainLookupEnd === nav.domainLookupStart &&
          nav.domContentLoadedEventEnd === nav.domContentLoadedEventStart
        ) {
          suspicious = true
          riskDelta = Math.max(riskDelta, 5)
          details.flatNavigationTiming = true
        }
      }
    }
  } catch {
    suspicious = true
    riskDelta = Math.max(riskDelta, 3)
    details.exception = true
  }

  return {
    name: "performance",
    detected: false,
    suspicious,
    weight: riskDelta,
    riskDelta,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}
