import { describe, it, expect } from "vitest"
import { analyze } from "../../src/analyze.js"

describe("analyze (integration)", () => {
  it("returns a HumanResult with the expected shape", async () => {
    const result = await analyze()
    expect(result).toHaveProperty("human")
    expect(result).toHaveProperty("score")
    expect(result).toHaveProperty("risk")
    expect(result).toHaveProperty("fingerprint")
    expect(result).toHaveProperty("signals")
    expect(typeof result.human).toBe("boolean")
    expect(typeof result.score).toBe("number")
    expect(["low", "medium", "high"]).toContain(result.risk)
    expect(typeof result.fingerprint).toBe("string")
    expect(Array.isArray(result.signals)).toBe(true)
  })

  it("score is between 0 and 100", async () => {
    const result = await analyze()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it("human is true when score >= 50", async () => {
    const result = await analyze()
    expect(result.human).toBe(result.score >= 50)
  })
})
