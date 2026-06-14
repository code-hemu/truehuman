const g = globalThis as Record<string, unknown>
const hasChrome = typeof g.chrome !== "undefined"

export function checkNavigation(): (string | number)[] {
  const codes: (string | number)[] = []

  if (!hasChrome || localStorage.length !== 0 || !performance) {
    return codes
  }

  const entries = performance.getEntriesByType("navigation")
  if (!entries || !entries.length) return codes

  const entry = entries[0] as PerformanceNavigationTiming
  if (
    entry &&
    entry.type === "navigate" &&
    entry.duration === 0 &&
    entry.transferSize === 0 &&
    entry.domComplete === 0
  ) {
    if (entry.fetchStart === 0 || entry.secureConnectionStart === 0) {
      codes.push(20.1)
    }

    if (
      entry.connectEnd === entry.connectStart &&
      entry.responseEnd === entry.responseStart &&
      entry.loadEventEnd === entry.loadEventStart &&
      entry.domainLookupEnd === entry.domainLookupStart &&
      entry.domContentLoadedEventEnd === entry.domContentLoadedEventStart
    ) {
      codes.push(20.2)
    }
  }

  return codes
}
