import { describe, it, expect, vi, afterEach } from "vitest"

const EXAMPLE_URL = new URL("http://example.com/")

describe("hardwarePlugin", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    })
  })

  it("should return a plugin with the name 'hardware'", async () => {
    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const plugin = hardwarePlugin()
    expect(plugin.name).toBe("hardware")
    expect(typeof plugin.fn).toBe("function")
  })

  it("should return hardwareConcurrency and deviceMemory with a profile", async () => {
    vi.stubGlobal("location", EXAMPLE_URL)

    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin().fn()

    expect(result.value).toHaveProperty("hardwareConcurrency")
    expect(result.value).toHaveProperty("deviceMemory")
    expect(result.value).toHaveProperty("profile")
    expect(["unknown", "low-end", "mid-range", "high-end", "vm-like"]).toContain(result.value.profile)
    expect(result.codes).toEqual([])
  })

  it("should emit 92.1 when hardwareConcurrency is missing", async () => {
    vi.stubGlobal("location", EXAMPLE_URL)
    const original = navigator.hardwareConcurrency
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => undefined,
      configurable: true,
    })

    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin().fn()

    expect(result.codes).toEqual([92.1])
    expect(result.value.profile).toBe("unknown")
  })

  it("should emit 92.2 for VM-like profile (2 cores, 8GB)", async () => {
    vi.stubGlobal("location", EXAMPLE_URL)
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => 2,
      configurable: true,
    })
    Object.defineProperty(navigator as unknown as Record<string, unknown>, "deviceMemory", {
      get: () => 8,
      configurable: true,
    })

    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin().fn()

    expect(result.codes).toEqual([92.2])
    expect(result.value.profile).toBe("vm-like")
  })

  it("should skip in file:// referrer context", async () => {
    vi.stubGlobal("location", new URL("file:///C:/index.html"))

    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin().fn()

    expect(result.value).toMatchObject({ skipped: true })
    expect(result.codes).toEqual([])
  })

  it("should skip on localhost", async () => {
    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin().fn()

    expect(result.value).toMatchObject({ skipped: true })
    expect(result.codes).toEqual([])
  })

  it("should skip when referrer filter does not match", async () => {
    vi.stubGlobal("location", EXAMPLE_URL)
    Object.defineProperty(document, "referrer", {
      value: "https://external-site.com",
      configurable: true,
    })

    const { hardwarePlugin } = await import("../../src/detectors/hardware.js")
    const result = await hardwarePlugin({ referrer: "direct" }).fn()

    expect(result.value).toMatchObject({ skipped: true })
    expect(result.codes).toEqual([])
  })

  it("should be accessible via detector.hardware factory", async () => {
    const mod = await import("../../src/plugin.js")
    expect(mod.detector.hardware).toBeDefined()
    expect(typeof mod.detector.hardware).toBe("function")
  })
})
