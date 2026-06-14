import { describe, it, expect } from "vitest"
import { detectIframe } from "../../src/detectors/iframe.js"

describe("detectIframe", () => {
  it("returns a result with name iframe", () => {
    const result = detectIframe()
    expect(result.name).toBe("iframe")
  })

  it("returns a SignalResult with expected shape", () => {
    const result = detectIframe()
    expect(result).toHaveProperty("detected")
    expect(result).toHaveProperty("suspicious")
    expect(result).toHaveProperty("weight")
    expect(result).toHaveProperty("riskDelta")
    expect(typeof result.weight).toBe("number")
    expect(result.weight).toBeGreaterThanOrEqual(0)
    expect(result.weight).toBeLessThanOrEqual(100)
    expect(result.suspicious).toBe(false)
    expect(result.riskDelta).toBeGreaterThanOrEqual(0)
  })

  it("returns iframeCreationFailed when iframe cannot be created", () => {
    const origEl = document.documentElement
    const fakeEl = {
      appendChild: () => { throw new Error("fail") },
    } as unknown as HTMLElement
    Object.defineProperty(document, "documentElement", {
      value: fakeEl,
      configurable: true,
    })
    try {
      const result = detectIframe()
      expect(result.details?.iframeCreationFailed).toBe(true)
      expect(result.weight).toBe(0)
      expect(result.riskDelta).toBe(0)
    } finally {
      Object.defineProperty(document, "documentElement", {
        value: origEl,
        configurable: true,
      })
    }
  })

  it("detects and caps weight at 100", () => {
    const origDesc = Object.getOwnPropertyDescriptor(document, "hidden")
    Object.defineProperty(document, "hidden", {
      get: () => true,
      configurable: true,
    })
    try {
      const result = detectIframe()
      expect(result.weight).toBeLessThanOrEqual(100)
      expect(result.riskDelta).toBeLessThanOrEqual(100)
    } finally {
      if (origDesc) {
        Object.defineProperty(document, "hidden", origDesc)
      }
    }
  })
})
