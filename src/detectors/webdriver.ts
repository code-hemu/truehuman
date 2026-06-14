import type { SignalResult } from "../types/index.js"
import { isPropertyNative } from "../utils/helpers.js"

const win = window as unknown as Record<string, unknown>
const nav = navigator as unknown as Record<string, unknown>

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

export function detectWebDriver(): SignalResult {
  const details: Record<string, unknown> = {}
  let detected = false
  let score = 0

  if (nav.webdriver) {
    detected = true
    score += 25
    details.webdriver = true
  }

  const chrome = win.chrome as Record<string, unknown> | undefined
  const chromeRuntime = chrome?.runtime as Record<string, unknown> | undefined
  if (chromeRuntime?.connect) {
    try {
      postMessage(chromeRuntime.connect as string, "*")
    } catch (e: unknown) {
      const msg = (e as Error).message
      if (!msg.includes("[native code]")) {
        detected = true
        score += 15
        details.chromeRuntimeConnectTampered = true
      }
    }
  }

  try {
    const fnToString = Function.prototype.toString
    if (!fnToString.apply(Function.toString).includes("toString")) {
      detected = true
      score += 10
      details.functionToStringTampered = true
    }
    Object.getOwnPropertyDescriptor(Function.prototype, "toString")?.value?.()
  } catch (e: unknown) {
    const err = e as Error
    const noStack = !err.stack?.includes("at Object.toString")
    const noMessage = !err.message?.includes("Function.prototype.toString")
    if (noStack || noMessage) {
      detected = true
      score += 10
      details.functionToStringDescriptorTampered = true
    }
  }

  const chromeApp = chrome?.app as Record<string, unknown> | undefined
  if (chromeApp) {
    detected = true
    score += 10
    details.chromeApp = true
  }

  const props: string[] = [
    "vendor",
    "platform",
    "languages",
    "webdriver",
    "permissions",
    "getUserMedia",
  ]
  for (const prop of props) {
    if (
      Object.getOwnPropertyDescriptor(navigator, prop) !== undefined
    ) {
      score += 5
      details[`navigator_${prop}_overridden`] = true
    }
    const native = isPropertyNative(Navigator.prototype, prop)
    if (native === false) {
      detected = true
      score += 8
      details[`navigator_${prop}_nonNative`] = true
    }
    if (isPropertyOverridden(Navigator.prototype, prop)) {
      detected = true
      score += 5
      details[`navigator_${prop}_writable`] = true
    }
  }

  const weight = Math.min(score, 100)
  return {
    name: "webdriver",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}
