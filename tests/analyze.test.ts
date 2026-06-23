import { describe, it, expect } from "vitest"

describe("truehuman", () => {
  it("should export analyze function", async () => {
    const mod = await import("../src/analyze.js")
    expect(mod.analyze).toBeDefined()
    expect(typeof mod.analyze).toBe("function")
  })

  it("should return public mode result with correct shape", async () => {
    const { analyze } = await import("../src/analyze.js")
    const result = analyze("public")

    expect(result).toBeDefined()
    expect(result).toHaveProperty("visitorId")
    expect(result).toHaveProperty("referrer")
    expect(result).toHaveProperty("visitor")
    expect(result).toHaveProperty("risk")
    expect(result).toHaveProperty("confidence")
    expect(result).toHaveProperty("components")

    expect(["human", "suspicious", "bot"]).toContain(result.visitor)
    expect(["direct", "internal", "external", "file", "localhost"]).toContain(result.referrer)
    expect(result.risk).toHaveProperty("score")
    expect(result.risk).toHaveProperty("level")
    expect(["low", "medium", "high", "critical"]).toContain(result.risk.level)
    expect(typeof result.confidence).toBe("number")
    expect(result.debug).toBeUndefined()
  })

  it("should include debug info in debug mode", async () => {
    const { analyze } = await import("../src/analyze.js")
    const result = analyze("debug")

    expect(result.debug).toBeDefined()
    expect(result.debug).toHaveProperty("integrityCodes")
    expect(result.debug).toHaveProperty("iframeComparisons")
    expect(result.debug).toHaveProperty("environmentFlag")
    expect(result.debug).toHaveProperty("errors")
  })
})
