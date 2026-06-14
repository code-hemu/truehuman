import { describe, it, expect, beforeEach } from "vitest"
import { detectHeadless } from "../../src/detectors/headless.js"

describe("detectHeadless", () => {
  beforeEach(() => {
    Object.defineProperty(window, "screenLeft", { value: 0, configurable: true })
    Object.defineProperty(window, "screenTop", { value: 0, configurable: true })
    Object.defineProperty(window, "matchMedia", {
      value: () => ({ matches: false }),
      configurable: true,
    })
    Object.defineProperty(navigator, "permissions", {
      value: { query: async () => ({}) },
      configurable: true,
    })
    Object.defineProperty(window, "Notification", {
      value: class {},
      configurable: true,
    })
    Object.defineProperty(window, "external", {
      value: { toString: () => "[object External]" },
      configurable: true,
    })
  })

  it("returns not detected with normal user agent", () => {
    const result = detectHeadless()
    expect(result.name).toBe("headless")
    expect(result.detected).toBe(false)
    expect(result.suspicious).toBe(false)
    expect(result.weight).toBe(0)
    expect(result.riskDelta).toBe(0)
  })

  it("detects headless user agent", () => {
    const orig = navigator.userAgent
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 Headless Chrome",
      configurable: true,
    })
    try {
      const result = detectHeadless()
      expect(result.detected).toBe(true)
      expect(result.weight).toBeGreaterThanOrEqual(30)
      expect(result.details?.headlessUA).toBe(true)
    } finally {
      Object.defineProperty(navigator, "userAgent", {
        value: orig,
        configurable: true,
      })
    }
  })

  it("detects Android WebView user agent", () => {
    const orig = navigator.userAgent
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36; wv",
      configurable: true,
    })
    try {
      const result = detectHeadless()
      expect(result.detected).toBe(true)
      expect(result.details?.androidWebView).toBe(true)
    } finally {
      Object.defineProperty(navigator, "userAgent", {
        value: orig,
        configurable: true,
      })
    }
  })

  it("detects when window APIs are missing", () => {
    Object.defineProperty(window, "close", { value: undefined, configurable: true, writable: true })
    Object.defineProperty(window, "Notification", { value: undefined, configurable: true, writable: true })
    try {
      const result = detectHeadless()
      expect(result.detected).toBe(true)
      expect(result.weight).toBeGreaterThan(0)
    } finally {
      Object.defineProperty(window, "close", { value: () => {}, configurable: true, writable: true })
      Object.defineProperty(window, "Notification", { value: class {}, configurable: true, writable: true })
    }
  })
})
