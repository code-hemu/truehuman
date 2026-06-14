import { describe, it, expect } from "vitest"
import { detectWebGL } from "../../src/detectors/webgl.js"

describe("detectWebGL", () => {
  it("returns a result with name webgl", () => {
    const result = detectWebGL()
    expect(result.name).toBe("webgl")
  })

  it("returns not detected when webgl is unavailable", () => {
    const origGetContext = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype)
    HTMLCanvasElement.prototype.getContext = (() => null) as any
    try {
      const result = detectWebGL()
      expect(result.detected).toBe(false)
      expect(result.suspicious).toBe(false)
      expect(result.weight).toBe(0)
      expect(result.riskDelta).toBe(0)
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext
    }
  })
})
