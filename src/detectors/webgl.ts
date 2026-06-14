import type { SignalResult } from "../types/index.js"
import { isPropertyNative } from "../utils/helpers.js"

export function detectWebGL(): SignalResult {
  const details: Record<string, unknown> = {}
  let detected = false
  let score = 0

  try {
    const canvas = document.createElement("canvas")
    const gl: WebGLRenderingContext | null =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
    if (!gl) {
      return { name: "webgl", detected: false, suspicious: false, weight: 0, riskDelta: 0 }
    }

    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (ext) {
      const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      if (vendor) {
        details.vendor = vendor
        if (
          vendor.toLowerCase().includes("vmware") ||
          renderer?.toLowerCase().includes("vmware")
        ) {
          detected = true
          score += 30
          details.vmwareGPU = true
        }
      }
    }

    const methods: [object, string][] = [
      [WebGLRenderingContext.prototype, "getExtension"],
      [WebGLRenderingContext.prototype, "getParameter"],
      [WebGLRenderingContext.prototype, "getSupportedExtensions"],
    ]
    for (const [proto, method] of methods) {
      const native = isPropertyNative(proto, method)
      if (native === false) {
        detected = true
        score += 10
        details[`webgl_${method}_nonNative`] = true
      }
    }
  } catch {
    score += 15
    detected = true
    details.exception = true
  }

  const weight = Math.min(score, 100)
  return {
    name: "webgl",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}
