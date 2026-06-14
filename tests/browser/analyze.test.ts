import { describe, it, expect } from "vitest"
import { analyze } from "../../src/analyze.js"

describe("analyze - real browser", () => {
  it("returns the expected result shape", async () => {
    const result = await analyze()
    expect(result).toHaveProperty("human")
    expect(result).toHaveProperty("score")
    expect(result).toHaveProperty("risk")
    expect(result).toHaveProperty("fingerprint")
    expect(result).toHaveProperty("signals")
  })

  it("fingerprint is a 64-character hex SHA-256 hash", async () => {
    const result = await analyze()
    expect(result.fingerprint).toMatch(/^[a-f0-9]{64}$/)
  })

  it("score is between 0 and 100", async () => {
    const result = await analyze()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it("human matches score >= 50", async () => {
    const result = await analyze()
    expect(result.human).toBe(result.score >= 50)
  })
})
