export type CheckComponent = "canvas" | "iframe" | "screen" | "webgl" | "webdriver" | "prototype" | "headless" | "storage" 
export type CheckStatus = "pass" | "suspicious" | "fail"
export type AnalyzeMode = "public" | "debug"

export interface CheckEvidence {
  detector: string
  message?: string
  code: number | string
}

export interface ComponentEntry {
  duration: number
  value: any
}

export interface DebugInfo {
  integrityCodes: (string | number)[]
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}

export interface AnalyzeResult {
  verdict: "human" | "suspicious" | "bot"
  risk: {
    score: number
    level: "low" | "medium" | "high" | "critical"
  }
  confidence: number
  components: Partial<Record<CheckComponent, ComponentEntry>>
  debug?: DebugInfo
}

export interface RegistryEntry {
  component: CheckComponent
  detector: string
  risk: number
}

const DOMAIN_DETECTORS: Record<number, { detector: string; component: CheckComponent; props: string[] }> = {
  30: { detector: "document", component: "headless", props: ["hidden", "hasFocus"] },
  31: { detector: "navigator", component: "headless", props: ["vendor", "platform", "languages", "webdriver", "permissions", "getUserMedia"] },
  32: { detector: "screen", component: "screen", props: ["width", "height", "orientation"] },
  33: { detector: "date", component: "headless", props: ["toString", "getTimezoneOffset"] },
  34: { detector: "iframe-element", component: "iframe", props: ["src", "srcdoc"] },
  35: { detector: "prototype", component: "prototype", props: Array.from({ length: 15 }, (_, i) => `method#${i + 1}`) },
}

const PREFIX_LABELS: Record<number, string> = {
  1: "has own property descriptor",
  2: "getter is writable",
  3: "getter is not native",
  4: "value is not native",
}

const PREFIX_RISK: Record<number, number> = {
  1: 5,
  2: 8,
  3: 15,
  4: 15,
}

const EXACT: Record<string, RegistryEntry> = {
  "10.1": { component: "headless", detector: "user-agent", risk: 15 },
  "10.2": { component: "headless", detector: "user-agent", risk: 20 },
  "10.3": { component: "headless", detector: "user-agent", risk: 20 },
  "10.4": { component: "headless", detector: "user-agent", risk: 20 },

  "11.1": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.2": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.3": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.4": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.5": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.6": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.7": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.8": { component: "headless", detector: "essential-apis", risk: 10 },
  "11.9": { component: "headless", detector: "essential-apis", risk: 10 },

  "20.1": { component: "headless", detector: "navigation", risk: 25 },
  "20.2": { component: "headless", detector: "navigation", risk: 25 },

  "35.1": { component: "webgl", detector: "prototype", risk: 30 },

  "41": { component: "webdriver", detector: "webdriver", risk: 35 },
  "42.1": { component: "webdriver", detector: "chrome-app", risk: 5 },
  "42.2": { component: "webdriver", detector: "postmessage", risk: 40 },
  "42.3": { component: "webdriver", detector: "function-tostring", risk: 40 },
  "42.4": { component: "webdriver", detector: "devtools", risk: 15 },

  "43.2": { component: "screen", detector: "screen", risk: 25 },
  "43.4": { component: "screen", detector: "screen", risk: 20 },
  "43.5": { component: "screen", detector: "screen", risk: 20 },

  "44.2": { component: "webdriver", detector: "browser-flags", risk: 15 },
  "44.3": { component: "webdriver", detector: "browser-flags", risk: 15 },
  "44.4": { component: "webdriver", detector: "browser-flags", risk: 10 },
  "46": { component: "webdriver", detector: "browser-flags", risk: 20 },

  "60.1": { component: "storage", detector: "storage", risk: 5 },
  "60.2": { component: "storage", detector: "storage", risk: 3 },
  "60.3": { component: "storage", detector: "storage", risk: 8 },

  "47.1": { component: "canvas", detector: "canvas", risk: 25 },
  "47.2": { component: "canvas", detector: "canvas", risk: 20 },
  "47.3": { component: "canvas", detector: "canvas", risk: 30 }
}

const EXACT_MESSAGES: Record<string, string> = {
  "10.1": "Android WebView UA pattern detected",
  "10.2": "Headless browser UA pattern detected",
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

  "47.1": "Canvas 2D context unavailable (blocked)",
  "47.2": "Canvas winding rule not supported",
  "47.3": "Canvas pixel data all zeros (noise injection)",
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

function matchIntegrityMessage(domain: number, prefix: number, idx: number): string | null {
  const domainInfo = DOMAIN_DETECTORS[domain]
  if (!domainInfo) return null

  const propName = domainInfo.props[idx - 1] || `index#${idx}`
  const label = PREFIX_LABELS[prefix]
  if (!label) return null

  return `${propName}: ${label}`
}

export function lookupCode(code: string | number): RegistryEntry | null {
  const key = String(code)

  const exact = EXACT[key]
  if (exact) return exact

  const compMatch = key.match(/^50\.(\d+)$/)
  if (compMatch) {
    return {
      component: "iframe",
      detector: "comparison",
      risk: 15,
    }
  }

  const intMatch = key.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (intMatch) {
    const domain = parseInt(intMatch[1], 10)
    const prefix = parseInt(intMatch[2], 10)
    const idx = parseInt(intMatch[3], 10)
    return matchIntegrityCode(domain, prefix, idx)
  }

  return null
}

function matchIntegrityCode(domain: number, prefix: number, idx: number): RegistryEntry | null {
  const domainInfo = DOMAIN_DETECTORS[domain]
  if (!domainInfo) return null

  const propName = domainInfo.props[idx - 1] || `index#${idx}`
  const label = PREFIX_LABELS[prefix]
  const risk = PREFIX_RISK[prefix]

  if (!label) return null

  return {
    component: domainInfo.component,
    detector: domainInfo.detector,
    risk,
  }
}
