import { vi, describe, it, expect } from "vitest"

vi.mock("../../src/utils/helpers.js", () => ({
  isPropertyNative: () => true,
}))

import { detectCanvas } from "../../src/detectors/canvas.js"

describe("detectCanvas", () => {
  it("returns not detected in a clean environment", () => {
    const result = detectCanvas()
    expect(result.name).toBe("canvas")
    expect(result.detected).toBe(false)
    expect(result.suspicious).toBe(false)
    expect(result.weight).toBe(0)
    expect(result.riskDelta).toBe(0)
  })

  it("detects when canvas methods are overridden", () => {
    Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
      value: () => "fake",
      writable: true,
    })
    try {
      const result = detectCanvas()
      expect(result.detected).toBe(true)
      expect(result.suspicious).toBe(false)
      expect(result.weight).toBeGreaterThan(0)
      expect(result.riskDelta).toBe(result.weight)
      expect(result.details?.["canvas_toDataURL_overridden"]).toBe(true)
    } finally {
      const orig = HTMLCanvasElement.prototype.toDataURL
      Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
        value: orig,
        writable: false,
      })
    }
  })
})
