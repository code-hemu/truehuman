import { describe, it, expect } from "vitest"
import { calculateRisk } from "../../src/scoring/risk.js"
import type { SignalResult } from "../../src/types/index.js"

function sig(
  name: string,
  detected: boolean,
  weight: number,
  riskDelta: number,
): SignalResult {
  return {
    name: name as SignalResult["name"],
    detected,
    suspicious: !detected && riskDelta > 0,
    weight,
    riskDelta,
  }
}

describe("calculateRisk", () => {
  it("returns score 100 and risk low for empty signals", () => {
    const result = calculateRisk([])
    expect(result.score).toBe(100)
    expect(result.risk).toBe("low")
  })

  it("returns score 100 when all riskDelta are 0", () => {
    const signals = [
      sig("webdriver", false, 0, 0),
      sig("headless", false, 0, 0),
      sig("plugins", false, 0, 0),
    ]
    const result = calculateRisk(signals)
    expect(result.score).toBe(100)
    expect(result.risk).toBe("low")
  })

  it("lowers score by the total riskDelta", () => {
    const signals = [sig("plugins", false, 8, 8)]
    const result = calculateRisk(signals)
    expect(result.score).toBe(92)
  })

  it("returns high risk for large totalDelta", () => {
    const signals = [sig("webdriver", true, 80, 80)]
    const result = calculateRisk(signals)
    expect(result.score).toBe(20)
    expect(result.risk).toBe("high")
  })

  it("returns medium risk for mid-range scores", () => {
    const signals = [sig("plugins", false, 8, 8), sig("languages", false, 7, 7)]
    const result = calculateRisk(signals)
    expect(result.score).toBe(85)
    expect(result.risk).toBe("low")
  })

  it("clamps score between 0 and 100", () => {
    const signals = [sig("webdriver", true, 200, 200)]
    const result = calculateRisk(signals)
    expect(result.score).toBe(0)
    expect(result.risk).toBe("high")
  })

  it("aggregates multiple riskDelta values", () => {
    const signals = [
      sig("webdriver", true, 30, 30),
      sig("headless", true, 20, 20),
      sig("plugins", false, 8, 8),
      sig("languages", false, 5, 5),
    ]
    const result = calculateRisk(signals)
    expect(result.score).toBe(37)
    expect(result.risk).toBe("high")
  })
})
