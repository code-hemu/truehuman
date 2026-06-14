import type { SignalResult } from "../types/index.js"

export function detectHeadless(): SignalResult {
  const details: Record<string, unknown> = {}
  let detected = false
  let score = 0

  if (/headless/i.test(navigator.userAgent)) {
    detected = true
    score += 30
    details.headlessUA = true
  }

  if (/; wv/i.test(navigator.userAgent)) {
    detected = true
    score += 20
    details.androidWebView = true
  }

  const expected: [string, unknown][] = [
    ["window.close", typeof window.close !== "undefined"],
    ["window.Notification", typeof Notification !== "undefined"],
    ["window.devicePixelRatio", typeof devicePixelRatio !== "undefined"],
    ["document.documentElement", !!document.documentElement],
    ["window.screenLeft", typeof window.screenLeft !== "undefined" || typeof window.screenTop !== "undefined"],
    ["window.matchMedia", typeof window.matchMedia === "function"],
    ["window.external", typeof window.external === "undefined" || typeof window.external?.toString === "function"],
    ["navigator.permissions", typeof navigator.permissions?.query === "function"],
    ["document.getAttributeNames", typeof document.documentElement?.getAttributeNames === "function"],
  ]

  for (const [name, ok] of expected) {
    if (!ok) {
      detected = true
      score += 8
      details[name] = "missing"
    }
  }

  const weight = Math.min(score, 100)
  return {
    name: "headless",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}
