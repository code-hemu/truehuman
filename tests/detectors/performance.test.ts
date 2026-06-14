import { describe, it, expect } from "vitest"
import { detectPerformance } from "../../src/detectors/performance.js"

function mockNavigationEntry(overrides: Partial<PerformanceNavigationTiming> = {}) {
  return {
    type: "navigate" as const,
    duration: 120,
    transferSize: 500,
    domComplete: 200,
    fetchStart: 10,
    secureConnectionStart: 5,
    connectEnd: 20,
    connectStart: 18,
    responseEnd: 300,
    responseStart: 280,
    loadEventEnd: 400,
    loadEventStart: 399,
    domainLookupEnd: 12,
    domainLookupStart: 10,
    domContentLoadedEventEnd: 250,
    domContentLoadedEventStart: 248,
    ...overrides,
  } as PerformanceNavigationTiming
}

describe("detectPerformance", () => {
  it("returns a result with name performance", () => {
    const result = detectPerformance()
    expect(result.name).toBe("performance")
    expect(result.detected).toBe(false)
  })

  it("returns not suspicious for realistic navigation timing", () => {
    const orig = performance.getEntriesByType.bind(performance)
    performance.getEntriesByType = (() => [mockNavigationEntry()]) as any
    try {
      const result = detectPerformance()
      expect(result.suspicious).toBe(false)
      expect(result.riskDelta).toBe(0)
    } finally {
      performance.getEntriesByType = orig
    }
  })

  it("flags suspicious for zero navigation timing pattern", () => {
    const orig = performance.getEntriesByType.bind(performance)
    performance.getEntriesByType = (() => [
      mockNavigationEntry({
        duration: 0,
        transferSize: 0,
        domComplete: 0,
        fetchStart: 10,
        secureConnectionStart: 5,
      }),
    ]) as any
    try {
      const result = detectPerformance()
      expect(result.suspicious).toBe(true)
      expect(result.riskDelta).toBe(8)
      expect(result.details?.zeroNavigationTiming).toBe(true)
    } finally {
      performance.getEntriesByType = orig
    }
  })

  it("flags suspicious for flat navigation timing pattern", () => {
    const orig = performance.getEntriesByType.bind(performance)
    performance.getEntriesByType = (() => [
      mockNavigationEntry({
        connectEnd: 20,
        connectStart: 20,
        responseEnd: 300,
        responseStart: 300,
        loadEventEnd: 400,
        loadEventStart: 400,
        domainLookupEnd: 12,
        domainLookupStart: 12,
        domContentLoadedEventEnd: 250,
        domContentLoadedEventStart: 250,
      }),
    ]) as any
    try {
      const result = detectPerformance()
      expect(result.suspicious).toBe(true)
      expect(result.riskDelta).toBe(5)
      expect(result.details?.flatNavigationTiming).toBe(true)
    } finally {
      performance.getEntriesByType = orig
    }
  })

  it("handles missing navigation entries gracefully", () => {
    const orig = performance.getEntriesByType.bind(performance)
    performance.getEntriesByType = (() => []) as any
    try {
      const result = detectPerformance()
      expect(result.suspicious).toBe(false)
      expect(result.riskDelta).toBe(0)
    } finally {
      performance.getEntriesByType = orig
    }
  })
})
