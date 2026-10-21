import "./dom-stub.mjs"

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { analyze, detector } from "../.test-build/index.js"
import { computeVerdict } from "../.test-build/scoring/confidence.js"
import { djb2Hex } from "../.test-build/utils/hash.js"

const COMPONENTS = [
  "audioBaseLatency",
  "canvas",
  "document",
  "essentialApis",
  "fonts",
  "fontPreferences",
  "forcedColors",
  "hardware",
  "iframe",
  "invertedColors",
  "navigation",
  "navigator",
  "plugins",
  "prototype",
  "screen",
  "screenMeta",
  "storage",
  "timezone",
  "userAgent",
  "webDriver",
  "webgl",
]

describe("analyze", () => {
  it("exports a callable analyze function", () => {
    assert.equal(typeof analyze, "function")
  })

  it("returns the documented public result shape", () => {
    const result = analyze("public")

    assert.equal(typeof result.visitorId, "string")
    assert.ok(result.visitorId.length > 0)

    assert.ok(["direct", "internal", "external", "file", "localhost"].includes(result.referrer))
    assert.ok(["human", "suspicious", "bot"].includes(result.visitor))

    assert.equal(typeof result.risk.score, "number")
    assert.ok(result.risk.score >= 0 && result.risk.score <= 100)
    assert.ok(["low", "medium", "high", "critical"].includes(result.risk.level))

    assert.equal(typeof result.confidence, "number")
    assert.ok(result.confidence >= 0 && result.confidence <= 100)
  })

  it("reports every known component with a duration and a value", () => {
    const { components } = analyze("public")

    for (const name of COMPONENTS) {
      assert.ok(name in components, `missing component: ${name}`)
      assert.equal(typeof components[name].duration, "number")
      assert.ok("value" in components[name])
    }
  })

  it("omits debug information in public mode", () => {
    const result = analyze("public")

    assert.equal(result.debug, undefined)
  })

  it("exposes raw diagnostics in debug mode", () => {
    const { debug } = analyze("debug")

    assert.ok(Array.isArray(debug.integrityCodes))
    assert.equal(typeof debug.iframeComparisons, "number")
    assert.ok(debug.environmentFlag === null || typeof debug.environmentFlag === "boolean")
    assert.ok(Array.isArray(debug.errors))
  })

  it("defaults to public mode when called without arguments", () => {
    const result = analyze()

    assert.equal(result.debug, undefined)
    assert.ok(["human", "suspicious", "bot"].includes(result.visitor))
  })

  it("keeps the visitor id stable for the same environment", () => {
    const first = analyze("public")
    const second = analyze("public")

    assert.equal(first.visitorId, second.visitorId)
  })
})

describe("plugin pipeline", () => {
  it("passes the detection context to plugins", async () => {
    let context = null

    await analyze({
      mode: "debug",
      plugins: [
        {
          name: "context",
          fn: (received) => {
            context = received
            return null
          },
        },
      ],
    })

    assert.ok(context)
    assert.ok(Array.isArray(context.integritychecks))
    assert.ok(Array.isArray(context.errors))
    assert.equal(typeof context.visitor, "string")
    assert.equal(typeof context.environmentFlag, "boolean")
  })

  it("merges plugin codes and values into the result", async () => {
    const result = await analyze({
      mode: "debug",
      plugins: [
        {
          name: "demo",
          fn: () => ({ codes: [12.3], value: { ok: true } }),
        },
      ],
    })

    assert.ok(result.debug.integrityCodes.includes(12.3))
    assert.deepEqual(result.components.demo.value, { ok: true })
  })

  it("records a failing plugin instead of throwing", async () => {
    const result = await analyze({
      mode: "debug",
      plugins: [
        {
          name: "broken",
          fn: () => {
            throw new Error("plugin failure")
          },
        },
      ],
    })

    assert.ok(result.debug.integrityCodes.includes(90.2))
  })

  it("survives a bundled plugin that cannot reach its provider", async () => {
    const result = await analyze({
      mode: "debug",
      plugins: [
        detector.grecaptcha({ siteKey: "test-key", endpoint: "https://example.test/verify" }),
        detector.turnstile({ siteKey: "test-key", endpoint: "https://example.test/verify" }),
      ],
    })

    assert.ok(result.debug.integrityCodes.includes(90.2))
    assert.ok(result.debug.integrityCodes.includes(91.2))
    assert.ok(["human", "suspicious", "bot"].includes(result.visitor))
  })
})

describe("detector plugins", () => {
  it("exposes the bundled detector factories", () => {
    assert.deepEqual(Object.keys(detector).sort(), ["grecaptcha", "hardware", "turnstile"])

    for (const factory of Object.values(detector)) {
      assert.equal(typeof factory, "function")
    }
  })

  it("builds plugins that carry a name and a runner", () => {
    const plugins = [
      detector.hardware(),
      detector.grecaptcha({ siteKey: "test-key", endpoint: "https://example.test/verify" }),
      detector.turnstile({ siteKey: "test-key", endpoint: "https://example.test/verify" }),
    ]

    assert.deepEqual(
      plugins.map((plugin) => plugin.name).sort(),
      ["hardware", "recaptcha", "turnstile"],
    )

    for (const plugin of plugins) {
      assert.equal(typeof plugin.fn, "function")
    }
  })
})

describe("scoring", () => {
  it("maps risk scores to verdicts", () => {
    assert.deepEqual(computeVerdict(0), { visitor: "human", risk: { level: "low" }, confidence: 100 })
    assert.deepEqual(computeVerdict(15), { visitor: "human", risk: { level: "low" }, confidence: 85 })
    assert.deepEqual(computeVerdict(16), { visitor: "suspicious", risk: { level: "medium" }, confidence: 84 })
    assert.deepEqual(computeVerdict(40), { visitor: "suspicious", risk: { level: "medium" }, confidence: 60 })
    assert.deepEqual(computeVerdict(41), { visitor: "suspicious", risk: { level: "high" }, confidence: 59 })
    assert.deepEqual(computeVerdict(50), { visitor: "suspicious", risk: { level: "high" }, confidence: 50 })
    assert.deepEqual(computeVerdict(51), { visitor: "bot", risk: { level: "high" }, confidence: 49 })
    assert.deepEqual(computeVerdict(70), { visitor: "bot", risk: { level: "high" }, confidence: 30 })
    assert.deepEqual(computeVerdict(71), { visitor: "bot", risk: { level: "critical" }, confidence: 29 })
    assert.deepEqual(computeVerdict(100), { visitor: "bot", risk: { level: "critical" }, confidence: 0 })
  })

  it("hashes strings into a stable hex digest", () => {
    assert.equal(djb2Hex("hello"), "0f923099")
    assert.equal(djb2Hex(""), "00001505")
    assert.equal(djb2Hex("hello"), djb2Hex("hello"))
    assert.match(djb2Hex("truehuman"), /^[0-9a-f]{8}$/)
  })
})
