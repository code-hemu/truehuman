import { describe, it, expect } from "vitest"
import { detectScreen } from "../../src/detectors/screen.js"

describe("detectScreen", () => {
  it("returns a result with name screen", () => {
    const result = detectScreen()
    expect(result.name).toBe("screen")
  })

  it("has correct default shape", () => {
    const result = detectScreen()
    expect(result).toHaveProperty("detected")
    expect(result).toHaveProperty("suspicious")
    expect(result).toHaveProperty("weight")
    expect(result).toHaveProperty("riskDelta")
    expect(result.suspicious).toBe(false)
  })

  it("detects tiny screen without touch support", () => {
    const origMTP = Object.getOwnPropertyDescriptor(navigator, "maxTouchPoints")
    const origWidth = Object.getOwnPropertyDescriptor(screen, "width")
    const origHeight = Object.getOwnPropertyDescriptor(screen, "height")
    Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true })
    Object.defineProperty(screen, "width", { value: 320, configurable: true })
    Object.defineProperty(screen, "height", { value: 240, configurable: true })
    try {
      const result = detectScreen()
      expect(result.detected).toBe(true)
      expect(result.details?.tinyScreenNoTouch).toBe(true)
    } finally {
      if (origMTP) Object.defineProperty(navigator, "maxTouchPoints", origMTP)
      if (origWidth) Object.defineProperty(screen, "width", origWidth)
      if (origHeight) Object.defineProperty(screen, "height", origHeight)
    }
  })

  it("detects inIframe when window is not top", () => {
    const origTop = window.top
    delete (window as any).top
    ;(window as any).top = {} as Window
    try {
      const result = detectScreen()
      expect(result.detected).toBe(true)
      expect(result.details?.inIframe).toBe(true)
    } finally {
      ;(window as any).top = origTop
    }
  })
})
