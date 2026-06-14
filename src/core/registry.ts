export type CheckCategory = "automation" | "browser_integrity" | "iframe_integrity" | "fingerprinting" | "behavioral"

export interface RegistryEntry {
  category: CheckCategory
  detector: string
  message: string
  riskDelta: number
}

const DOMAIN_DETECTORS: Record<number, { detector: string; category: CheckCategory; props: string[] }> = {
  30: { detector: "document", category: "browser_integrity", props: ["hidden", "hasFocus"] },
  31: { detector: "navigator", category: "browser_integrity", props: ["vendor", "platform", "languages", "webdriver", "permissions", "getUserMedia"] },
  32: { detector: "screen", category: "browser_integrity", props: ["width", "height", "orientation"] },
  33: { detector: "date", category: "browser_integrity", props: ["toString", "getTimezoneOffset"] },
  34: { detector: "iframe-element", category: "iframe_integrity", props: ["src", "srcdoc"] },
  35: { detector: "prototype", category: "fingerprinting", props: Array.from({ length: 10 }, (_, i) => `method#${i + 1}`) },
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
  "10.1": { category: "browser_integrity", detector: "user-agent", message: "Android WebView UA pattern detected", riskDelta: 15 },
  "10.2": { category: "browser_integrity", detector: "user-agent", message: "Headless browser UA pattern detected", riskDelta: 20 },
  "10.3": { category: "browser_integrity", detector: "user-agent", message: "Chrome UA with Firefox CSS feature", riskDelta: 20 },
  "10.4": { category: "browser_integrity", detector: "user-agent", message: "Firefox UA with Chrome CSS feature", riskDelta: 20 },

  "11.1": { category: "browser_integrity", detector: "essential-apis", message: "Missing createElement API", riskDelta: 10 },
  "11.2": { category: "browser_integrity", detector: "essential-apis", message: "Missing createEvent API", riskDelta: 10 },
  "11.3": { category: "browser_integrity", detector: "essential-apis", message: "Missing dispatchEvent API", riskDelta: 10 },
  "11.4": { category: "browser_integrity", detector: "essential-apis", message: "Missing getElementsByTagName API", riskDelta: 10 },
  "11.5": { category: "browser_integrity", detector: "essential-apis", message: "Missing addEventListener API", riskDelta: 10 },
  "11.6": { category: "browser_integrity", detector: "essential-apis", message: "Missing querySelector API", riskDelta: 10 },
  "11.7": { category: "browser_integrity", detector: "essential-apis", message: "Missing getElementById API", riskDelta: 10 },
  "11.8": { category: "browser_integrity", detector: "essential-apis", message: "Missing removeEventListener API", riskDelta: 10 },
  "11.9": { category: "browser_integrity", detector: "essential-apis", message: "Missing document.body API", riskDelta: 10 },

  "20.1": { category: "browser_integrity", detector: "navigation", message: "Performance navigation type 1 detected", riskDelta: 25 },
  "20.2": { category: "browser_integrity", detector: "navigation", message: "Performance navigation type 2 detected", riskDelta: 25 },

  "35.1": { category: "fingerprinting", detector: "prototype", message: "WebGL vendor is VMware (virtualized environment)", riskDelta: 30 },

  "41": { category: "automation", detector: "webdriver", message: "navigator.webdriver is enabled", riskDelta: 35 },
  "42.1": { category: "automation", detector: "chrome-app", message: "chrome.app runtime detected", riskDelta: 5 },
  "42.2": { category: "automation", detector: "postmessage", message: "postMessage-based Function.toString override detected", riskDelta: 40 },
  "42.3": { category: "automation", detector: "function-tostring", message: "Function.prototype.toString override detected", riskDelta: 40 },
  "42.4": { category: "automation", detector: "devtools", message: "DevTools tab count mismatch detected", riskDelta: 15 },

  "43.2": { category: "automation", detector: "screen", message: "Window inner/outer/height dimensions are equal (headless)", riskDelta: 25 },
  "43.4": { category: "automation", detector: "screen", message: "Unusually small screen size detected", riskDelta: 20 },
  "43.5": { category: "automation", detector: "screen", message: "Screen dimensions invalid or missing orientation", riskDelta: 20 },

  "44.2": { category: "automation", detector: "browser-flags", message: "Non-Chrome browser inconsistency detected", riskDelta: 15 },
  "44.3": { category: "automation", detector: "browser-flags", message: "Non-Chrome browser inconsistency detected", riskDelta: 15 },
  "44.4": { category: "automation", detector: "browser-flags", message: "Fullscreen API enabled without fullscreen state", riskDelta: 10 },
  "46": { category: "automation", detector: "browser-flags", message: "nods attribute present on document element", riskDelta: 20 },

  "60.1": { category: "behavioral", detector: "storage", message: "Page reloaded more than 5 times", riskDelta: 5 },
  "60.2": { category: "behavioral", detector: "storage", message: "localStorage is disabled or cleared", riskDelta: 3 },
  "60.3": { category: "behavioral", detector: "storage", message: "localStorage access error occurred", riskDelta: 8 },
}

export function lookupCode(code: string | number): RegistryEntry | null {
  const key = String(code)

  const exact = EXACT[key]
  if (exact) return exact

  const compMatch = key.match(/^50\.(\d+)$/)
  if (compMatch) {
    return {
      category: "iframe_integrity",
      detector: "comparison",
      message: `Iframe comparison #${compMatch[1]} failed`,
      riskDelta: 15,
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
    category: domainInfo.category,
    detector: domainInfo.detector,
    message: `${propName}: ${label}`,
    riskDelta: risk,
  }
}
