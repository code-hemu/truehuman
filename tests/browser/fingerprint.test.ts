import { describe, it, expect } from "vitest"
import { fingerprintCanvas } from "../../src/fingerprint/canvas.js"
import { fingerprintAudio } from "../../src/fingerprint/audio.js"
import { fingerprintWebGL } from "../../src/fingerprint/webgl.js"
import { analyze } from "../../src/analyze.js"

describe("fingerprint - real browser", () => {
  it("canvas fingerprint returns a non-empty string", () => {
    const fp = fingerprintCanvas()
    expect(fp).toBeTruthy()
    expect(typeof fp).toBe("string")
  })

  it("audio fingerprint returns a non-empty string", () => {
    const fp = fingerprintAudio()
    expect(fp).toBeTruthy()
    expect(typeof fp).toBe("string")
  })

  it("webgl fingerprint returns a non-empty string", () => {
    const fp = fingerprintWebGL()
    expect(fp).toBeTruthy()
    expect(typeof fp).toBe("string")
  })

  it("fingerprint is deterministic within the same session", async () => {
    const a = await analyze()
    const b = await analyze()
    expect(a.fingerprint).toBe(b.fingerprint)
  })
})
