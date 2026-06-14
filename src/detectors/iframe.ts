import type { SignalResult } from "../types/index.js"
import { createSandboxedIframe, cleanupIframe } from "../utils/helpers.js"

const nav = navigator as unknown as Record<string, unknown>

export function detectIframe(): SignalResult {
  const details: Record<string, unknown> = {}
  const mismatches: string[] = []
  let detected = false
  let score = 0

  if (window.location.protocol === "file:") {
    return {
      name: "iframe",
      detected: false,
      suspicious: false,
      weight: 0,
      riskDelta: 0,
      details: { skipped: true, protocol: "file:" },
    }
  }

  const iframe = createSandboxedIframe()
  if (!iframe) {
    return {
      name: "iframe",
      detected: false,
      suspicious: false,
      weight: 0,
      riskDelta: 0,
      details: { iframeCreationFailed: true },
    }
  }

  try {
    const cw = iframe.contentWindow
    if (!cw) {
      detected = true
      score += 20
      details.contentWindowMissing = true
      cleanupIframe(iframe)
      const w = Math.min(score, 100)
      return { name: "iframe", detected, suspicious: false, weight: w, riskDelta: w, details }
    }

    const cwNav = cw.navigator as unknown as Record<string, unknown>

    if (cwNav.userAgent !== navigator.userAgent) {
      mismatches.push("userAgent")
    }

    if (cwNav.vendor !== navigator.vendor) {
      mismatches.push("vendor")
    }

    if (cwNav.webdriver !== nav.webdriver) {
      mismatches.push("webdriver")
    }

    if (cw.document.hidden !== document.hidden) {
      mismatches.push("hidden")
    }

    const CwWindow = cw as unknown as Record<string, unknown>
    const cwDate = CwWindow.Date as unknown as DateConstructor
    const tzA = new Date().getTimezoneOffset()
    const tzB = new cwDate().getTimezoneOffset()
    if (tzA !== tzB) {
      mismatches.push("timezone")
    }

    if (mismatches.length > 0) {
      detected = true
      score += mismatches.length * 10
      details.mismatches = mismatches
    }

    const propsToCheck = ["hidden", "hasFocus"]
    for (const prop of propsToCheck) {
      if (Object.getOwnPropertyDescriptor(document, prop) !== undefined) {
        score += 5
        details[`document_${prop}_directOverride`] = true
      }
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, prop)
      if (desc) {
        if (desc.get) {
          if (desc.writable) {
            detected = true
            score += 5
            details[`document_${prop}_writable`] = true
          }
          if (!desc.get.toString().includes("[native code]")) {
            detected = true
            score += 8
            details[`document_${prop}_nonNative`] = true
          }
        }
        if (desc.value && !desc.value.toString().includes("[native code]")) {
          detected = true
          score += 5
          details[`document_${prop}_valueNonNative`] = true
        }
      }
    }

    const dateProps = ["toString", "getTimezoneOffset"]
    for (const prop of dateProps) {
      if (Object.getOwnPropertyDescriptor(new Date(), prop) !== undefined) {
        score += 3
        details[`date_${prop}_directOverride`] = true
      }
      const desc = Object.getOwnPropertyDescriptor(Date.prototype, prop)
      if (desc) {
        if (desc.get && desc.writable) {
          detected = true
          score += 3
          details[`date_${prop}_writable`] = true
        }
        if (
          desc.get &&
          !desc.get.toString().includes("[native code]")
        ) {
          detected = true
          score += 5
          details[`date_${prop}_nonNative`] = true
        }
      }
    }

    const iframeProps = ["src", "srcdoc"]
    for (const prop of iframeProps) {
      if (Object.getOwnPropertyDescriptor(iframe, prop) !== undefined) {
        score += 3
        details[`iframe_${prop}_directOverride`] = true
      }
      const desc = Object.getOwnPropertyDescriptor(
        HTMLIFrameElement.prototype,
        prop,
      )
      if (desc) {
        if (desc.get && desc.writable) {
          detected = true
          score += 3
          details[`iframe_${prop}_writable`] = true
        }
        if (
          desc.get &&
          !desc.get.toString().includes("[native code]")
        ) {
          detected = true
          score += 5
          details[`iframe_${prop}_nonNative`] = true
        }
      }
    }
  } catch {
    score += 10
    detected = true
    details.exception = true
  } finally {
    cleanupIframe(iframe)
  }

  const weight = Math.min(score, 100)
  return {
    name: "iframe",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}
