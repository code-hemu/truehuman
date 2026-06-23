import type { CheckComponent, RegistryEntry } from "../types/index.js"

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

const PREFIX_RISK: Record<number, number> = {
  1: 5,
  2: 8,
  3: 15,
  4: 15,
}

const EXACT: Record<string, RegistryEntry> = {
  "10.1": { component: "userAgent", detector: "user-agent", risk: 15 },
  "10.2": { component: "userAgent", detector: "user-agent", risk: 20 },
  "10.3": { component: "userAgent", detector: "user-agent", risk: 20 },
  "10.4": { component: "userAgent", detector: "user-agent", risk: 20 },

  "11.1": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.2": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.3": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.4": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.5": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.6": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.7": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.8": { component: "essentialApis", detector: "essential-apis", risk: 10 },
  "11.9": { component: "essentialApis", detector: "essential-apis", risk: 10 },

  "20.1": { component: "navigation", detector: "navigation", risk: 25 },
  "20.2": { component: "navigation", detector: "navigation", risk: 25 },

  "35.1": { component: "webgl", detector: "prototype", risk: 30 },

  "41": { component: "webDriver", detector: "webdriver", risk: 35 },
  "42.1": { component: "webDriver", detector: "chrome-app", risk: 5 },
  "42.2": { component: "webDriver", detector: "postmessage", risk: 40 },
  "42.3": { component: "webDriver", detector: "function-tostring", risk: 40 },
  "42.4": { component: "webDriver", detector: "devtools", risk: 15 },

  "43.2": { component: "screen", detector: "screen", risk: 25 },
  "43.4": { component: "screen", detector: "screen", risk: 20 },
  "43.5": { component: "screen", detector: "screen", risk: 20 },

  "44.2": { component: "webDriver", detector: "browser-flags", risk: 15 },
  "44.3": { component: "webDriver", detector: "browser-flags", risk: 15 },
  "44.4": { component: "webDriver", detector: "browser-flags", risk: 10 },
  "46": { component: "webDriver", detector: "browser-flags", risk: 20 },

  "60.1": { component: "storage", detector: "storage", risk: 5 },
  "60.2": { component: "storage", detector: "storage", risk: 3 },
  "60.3": { component: "storage", detector: "storage", risk: 8 },

  "61.1": { component: "storage", detector: "storage", risk: 3 },
  "62.1": { component: "storage", detector: "storage", risk: 3 },

  "47.1": { component: "canvas", detector: "canvas", risk: 25 },
  "47.2": { component: "canvas", detector: "canvas", risk: 20 },
  "47.3": { component: "canvas", detector: "canvas", risk: 30 },

  "70.1": { component: "fonts", detector: "fonts", risk: 5 },
  "70.2": { component: "fonts", detector: "fonts", risk: 20 },

  "71.1": { component: "fontPreferences", detector: "font-preferences", risk: 15 },

  "80.1": { component: "plugins", detector: "plugins", risk: 10 },

  "81.1": { component: "forcedColors", detector: "forced-colors", risk: 5 },

  "82.1": { component: "invertedColors", detector: "inverted-colors", risk: 5 },

  "85.1": { component: "audioBaseLatency", detector: "audio-base-latency", risk: 5 },
  "85.2": { component: "audioBaseLatency", detector: "audio-base-latency", risk: 10 },

  "90.1": { component: "recaptcha", detector: "recaptcha-score", risk: 25 },
  "90.2": { component: "recaptcha", detector: "recaptcha-api", risk: 0 },
  "90.3": { component: "recaptcha", detector: "recaptcha-rejected", risk: 0 },

  "91.1": { component: "turnstile", detector: "turnstile-fail", risk: 25 },
  "91.2": { component: "turnstile", detector: "turnstile-api", risk: 0 },

}

function matchIntegrityCode(domain: number, prefix: number, idx: number): RegistryEntry | null {
  const domainInfo = DOMAIN_DETECTORS[domain]
  if (!domainInfo) return null

  const risk = PREFIX_RISK[prefix]
  const label = PREFIX_LABELS[prefix]
  if (!label) return null

  return {
    component: domainInfo.component,
    detector: domainInfo.detector,
    risk,
  }
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
