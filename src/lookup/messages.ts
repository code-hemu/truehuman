import type { CheckComponent } from "../types/index.js"

const DOMAIN_DETECTORS: Record<number, { detector: string; component: CheckComponent; props: string[] }> = {
  30: { detector: "document", component: "document", props: ["hidden", "hasFocus"] },
  31: { detector: "navigator", component: "navigator", props: ["vendor", "platform", "languages", "webdriver", "permissions", "getUserMedia"] },
  32: { detector: "screen", component: "screen", props: ["width", "height", "orientation"] },
  33: { detector: "date", component: "essentialApis", props: ["toString", "getTimezoneOffset"] },
  34: { detector: "iframe-element", component: "iframe", props: ["src", "srcdoc"] },
  35: { detector: "prototype", component: "prototype", props: Array.from({ length: 15 }, (_, i) => `method#${i + 1}`) },
}

const PREFIX_LABELS: Record<number, string> = {
  1: "has own property descriptor",
  2: "getter is writable",
  3: "getter is not native",
  4: "value is not native",
}

const EXACT_MESSAGES: Record<string, string> = {
  "10.1": "Android WebView UA pattern detected",
  "10.2": "headless browser UA pattern detected",
  "10.3": "Chrome UA with Firefox CSS feature",
  "10.4": "Firefox UA with Chrome CSS feature",

  "11.1": "Missing createElement API",
  "11.2": "Missing createEvent API",
  "11.3": "Missing dispatchEvent API",
  "11.4": "Missing getElementsByTagName API",
  "11.5": "Missing addEventListener API",
  "11.6": "Missing querySelector API",
  "11.7": "Missing getElementById API",
  "11.8": "Missing removeEventListener API",
  "11.9": "Missing document.body API",

  "20.1": "Performance navigation type 1 detected",
  "20.2": "Performance navigation type 2 detected",

  "35.1": "WebGL vendor is VMware (virtualized environment)",

  "41": "navigator.webdriver is enabled",
  "42.1": "chrome.app runtime detected",
  "42.2": "postMessage-based Function.toString override detected",
  "42.3": "Function.prototype.toString override detected",
  "42.4": "DevTools tab count mismatch detected",

  "43.2": "Window inner/outer/height dimensions are equal (headless)",
  "43.4": "Unusually small screen size detected",
  "43.5": "Screen dimensions invalid or missing orientation",

  "44.2": "Non-Chrome browser inconsistency detected",
  "44.3": "Non-Chrome browser inconsistency detected",
  "44.4": "Fullscreen API enabled without fullscreen state",
  "46": "nods attribute present on document element",

  "60.1": "Page reloaded more than 5 times",
  "60.2": "localStorage is disabled or cleared",
  "60.3": "localStorage access error occurred",

  "61.1": "sessionStorage is unavailable",
  "62.1": "indexedDB is unavailable",

  "47.1": "Canvas 2D context unavailable (blocked)",
  "47.2": "Canvas winding rule not supported",
  "47.3": "Canvas pixel data all zeros (noise injection)",

  "70.1": "Unusually low number of system fonts detected",
  "70.2": "Font detection failed or blocked",

  "71.1": "Font preference metrics unavailable or abnormal",

  "80.1": "navigator.plugins is unavailable or blocked",

  "81.1": "Forced colors mode is active",

  "82.1": "Inverted colors mode is active",

  "85.1": "AudioContext not available",
  "85.2": "AudioContext baseLatency is null or non-finite",

  "90.1": "reCAPTCHA score below threshold",
  "90.2": "reCAPTCHA API unavailable (infrastructure, not bot evidence)",
  "90.3": "reCAPTCHA verification rejected (infrastructure, not bot evidence)",

  "91.1": "Turnstile verification failed",
  "91.2": "Turnstile API unavailable (infrastructure, not bot evidence)",

}

function matchIntegrityMessage(domain: number, prefix: number, idx: number): string | null {
  const domainInfo = DOMAIN_DETECTORS[domain]
  if (!domainInfo) return null

  const propName = domainInfo.props[idx - 1] || `index#${idx}`
  const label = PREFIX_LABELS[prefix]
  if (!label) return null

  return `${propName}: ${label}`
}

export function lookupMessage(code: string | number): string | null {
  const key = String(code)

  const exact = EXACT_MESSAGES[key]
  if (exact) return exact

  const compMatch = key.match(/^50\.(\d+)$/)
  if (compMatch) return `Iframe comparison #${compMatch[1]} failed`

  const intMatch = key.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (intMatch) {
    const domain = parseInt(intMatch[1], 10)
    const prefix = parseInt(intMatch[2], 10)
    const idx = parseInt(intMatch[3], 10)
    return matchIntegrityMessage(domain, prefix, idx)
  }

  return null
}
