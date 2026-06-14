import { describe, it, expect } from "vitest"
import { analyze } from "../src/analyze.js"

describe("analyze", () => {
  it("default mode (public) returns expected shape", () => {
    const r = analyze()
    expect(typeof r.verdict).toBe("string")
    expect(typeof r.human).toBe("boolean")
    expect(typeof r.direct).toBe("boolean")
    expect(typeof r.riskScore).toBe("number")
    expect(typeof r.riskLevel).toBe("string")
    expect(typeof r.confidence).toBe("number")
    expect(r.checks).toHaveProperty("passed")
    expect(r.checks).toHaveProperty("suspicious")
    expect(r.checks).toHaveProperty("failed")
    expect(r.debug).toBeUndefined()
  })

  it("detailed mode returns CheckResult[]", () => {
    const r = analyze("detailed")
    expect(Array.isArray(r.checks)).toBe(true)
    expect(r.debug).toBeUndefined()
    for (const c of r.checks as { name: string; status: string; riskDelta: number; evidence: unknown[] }[]) {
      expect(typeof c.name).toBe("string")
      expect(["pass", "suspicious", "fail"]).toContain(c.status)
      expect(typeof c.riskDelta).toBe("number")
      expect(Array.isArray(c.evidence)).toBe(true)
    }
  })

  it("debug mode includes raw internals", () => {
    const r = analyze("debug")
    expect(Array.isArray(r.checks)).toBe(true)
    expect(r.debug).toBeDefined()
    expect(Array.isArray(r.debug!.integrityCodes)).toBe(true)
    expect(typeof r.debug!.iframeComparisons).toBe("number")
    expect(r.debug!.environmentFlag === true || r.debug!.environmentFlag === false || r.debug!.environmentFlag === null).toBe(true)
    expect(Array.isArray(r.debug!.errors)).toBe(true)
  })

  it("riskScore is between 0 and 100", () => {
    const r = analyze()
    expect(r.riskScore).toBeGreaterThanOrEqual(0)
    expect(r.riskScore).toBeLessThanOrEqual(100)
  })

  it("confidence is between 0 and 100", () => {
    const r = analyze()
    expect(r.confidence).toBeGreaterThanOrEqual(0)
    expect(r.confidence).toBeLessThanOrEqual(100)
  })
})
