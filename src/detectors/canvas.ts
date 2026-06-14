import type { SignalResult } from "../types/index.js"
import { isPropertyNative } from "../utils/helpers.js"

export function detectCanvas(): SignalResult {
  const details: Record<string, unknown> = {}
  let detected = false
  let score = 0

  const methods: [object, string][] = [
    [HTMLCanvasElement.prototype, "toBlob"],
    [HTMLCanvasElement.prototype, "toDataURL"],
    [CanvasRenderingContext2D.prototype, "getImageData"],
    [HTMLElement.prototype, "offsetWidth"],
    [HTMLElement.prototype, "offsetHeight"],
  ]
  for (const [proto, method] of methods) {
    const native = isPropertyNative(proto, method)
    if (native === false) {
      detected = true
      score += 12
      details[`canvas_${method}_nonNative`] = true
    }
    if (isPropertyOverridden(proto, method)) {
      detected = true
      score += 8
      details[`canvas_${method}_overridden`] = true
    }
  }

  const weight = Math.min(score, 100)
  return {
    name: "canvas",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}

function isPropertyOverridden(proto: object, prop: string): boolean {
  try {
    const desc = Object.getOwnPropertyDescriptor(proto, prop)
    if (!desc) return false
    if (desc.get) return desc.writable ?? false
    if (desc.value) return desc.writable ?? false
    return false
  } catch {
    return false
  }
}
