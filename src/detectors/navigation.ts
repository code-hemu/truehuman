export function checkNavigation(): {
  value: string
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  const entries = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[]

  const entry = entries[0]

  if (!entry) {
    return {
      value: "unavailable",
      codes,
    }
  }

  if (
    entry.type === "navigate" &&
    entry.duration === 0 &&
    entry.transferSize === 0 &&
    entry.domComplete === 0
  ) {
    if (
      entry.fetchStart === 0 ||
      entry.secureConnectionStart === 0
    ) {
      codes.push(20.1)
    }

    if (
      entry.connectEnd === entry.connectStart &&
      entry.responseEnd === entry.responseStart &&
      entry.loadEventEnd === entry.loadEventStart &&
      entry.domainLookupEnd === entry.domainLookupStart &&
      entry.domContentLoadedEventEnd ===
        entry.domContentLoadedEventStart
    ) {
      codes.push(20.2)
    }
  }

  return {
    value: entry.type,
    codes,
  }
}
