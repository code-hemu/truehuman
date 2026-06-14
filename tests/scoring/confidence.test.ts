import { describe, it, expect } from "vitest"
import { calculateConfidence } from "../../src/scoring/confidence.js"

describe("calculateConfidence", () => {
  it("returns 0 when no signals provided", () => {
    expect(calculateConfidence([], 100)).toBe(0)
  })

  it("returns high confidence for clean signals with high score", () => {
    const signals = [
      { name: "webdriver", detected: false, weight: 0 },
      { name: "headless", detected: false, weight: 0 },
      { name: "iframe", detected: false, weight: 0 },
    ]
    const confidence = calculateConfidence(signals, 100)
    expect(confidence).toBe(100)
  })

  it("returns low confidence when all signals are detected", () => {
    const signals = [
      { name: "webdriver", detected: true, weight: 100 },
      { name: "headless", detected: true, weight: 100 },
    ]
    const confidence = calculateConfidence(signals, 0)
    expect(confidence).toBe(0)
  })

  it("returns moderate confidence for mixed signals", () => {
    const signals = [
      { name: "webdriver", detected: true, weight: 50 },
      { name: "headless", detected: false, weight: 0 },
    ]
    const confidence = calculateConfidence(signals, 50)
    expect(confidence).toBeGreaterThan(0)
    expect(confidence).toBeLessThan(100)
  })
})
