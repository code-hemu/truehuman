import type { Plugin, PluginContext, RecaptchaOptions } from "../types/index.js"
import { getReferrer } from "../utils/referrer.js"

declare var grecaptcha: {
  ready: (cb: () => void) => void
  execute: (
    siteKey: string,
    options: { action: string }
  ) => Promise<string>
}

function injectScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (
      document.querySelector(
        'script[src*="recaptcha/api.js"]',
      )
    ) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true

    script.onload = () => resolve()
    script.onerror = () =>
      reject(
        new Error(
          "Failed to load reCAPTCHA script",
        ),
      )

    document.head.appendChild(script)
  })
}

export function recaptchaPlugin(
  options: RecaptchaOptions,
): Plugin {
  const {
    siteKey,
    action = "submit",
    endpoint,
    threshold = 0.5,
    saveTokens = false,
  } = options

  return {
    name: "recaptcha",

    fn: async (context?: PluginContext) => {
      const currentReferrer = getReferrer()

      if (currentReferrer === "file" || currentReferrer === "localhost") {
        return {
          value: { score: 0, success: false, skipped: true },
          codes: [],
        }
      }

      if (saveTokens && context?.visitor === "human" && !context.environmentFlag) {
        return {
          value: { score: 0, success: false, skipped: true, reason: "feathers_flagged" },
          codes: [],
        }
      }

      try {
        await injectScript(siteKey)
      } catch {
        return {
          value: { score: 0, success: false },
          codes: [90.2],
        }
      }

      let token: string
      try {
        await new Promise<void>((resolve) => grecaptcha.ready(resolve))
        token = await grecaptcha.execute(siteKey, { action })
      } catch {
        return {
          value: { score: 0, success: false },
          codes: [90.2],
        }
      }

      let data: { success: boolean; score?: number }
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action }),
        })
        data = await response.json()
      } catch {
        return {
          value: { score: 0, success: false },
          codes: [90.2],
        }
      }

      if (!data.success) {
        return {
          value: { score: 0, success: false },
          codes: [90.3],
        }
      }

      if (data.score === undefined) {
        return {
          value: { score: 0, success: true },
          codes: [90.3],
        }
      }

      if (data.score < threshold) {
        return {
          value: { score: data.score, success: true },
          codes: [90.1],
        }
      }

      return {
        value: { score: data.score, success: true },
        codes: [],
      }
    },
  }
}