import { describe, it, expect } from "vitest"
import { detectWebDriver } from "../../src/detectors/webdriver.js"
import { detectHeadless } from "../../src/detectors/headless.js"
import { detectCanvas } from "../../src/detectors/canvas.js"
import { detectWebGL } from "../../src/detectors/webgl.js"
import { analyze } from "../../src/analyze.js"

describe("detection - Playwright automation", () => {
  it("webdriver detector flags Playwright automation", () => {
    const result = detectWebDriver()
    expect(result.detected).toBe(true)
    expect(result.weight).toBeGreaterThan(0)
  })

  it("headless detector flags Playwright headless Chrome", () => {
    const result = detectHeadless()
    expect(result.detected).toBe(true)
    expect(result.weight).toBeGreaterThan(0)
  })

  it("canvas detector flags automation", () => {
    const result = detectCanvas()
    expect(result.detected).toBe(true)
    expect(result.weight).toBeGreaterThan(0)
  })

  it("webgl detector does not false-positive on WebGL", () => {
    const result = detectWebGL()
    expect(result.detected).toBe(false)
    expect(result.suspicious).toBe(false)
  })

  it("analyze returns human: false due to automation signals", async () => {
    const result = await analyze()
    expect(result.human).toBe(false)
    expect(result.score).toBeGreaterThan(0)
    expect(result.signals.length).toBeGreaterThan(0)
  })

  it("signals include webdriver, headless, and canvas", async () => {
    const result = await analyze()
    expect(result.signals).toContain("webdriver")
    expect(result.signals).toContain("headless")
    expect(result.signals).toContain("canvas")
  })
})
