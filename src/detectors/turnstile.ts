import type { Plugin, PluginContext, TurnstileOptions } from "../types/index.js"
import { getReferrer } from "../utils/referrer.js"

declare var turnstile: {
  render: (container: string | HTMLElement, options: {
    sitekey: string
    execution?: "render" | "execute"
    appearance?: "always" | "execute" | "interaction-only"
    callback?: (token: string) => void
    "error-callback"?: (error: string) => void
  }) => string
  execute: (container: string | HTMLElement) => void
  remove: (widgetId: string) => void
}

function injectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Turnstile script"))
    document.head.appendChild(script)
  })
}

export function turnstilePlugin(options: TurnstileOptions): Plugin {
  const {
    siteKey,
    endpoint,
    appearance = "interaction-only",
    saveTokens = false,
  } = options

  return {
    name: "turnstile",

    fn: async (context?: PluginContext) => {
      const currentReferrer = getReferrer()

      if (currentReferrer === "file" || currentReferrer === "localhost") {
        return {
          value: { success: false, skipped: true },
          codes: [],
        }
      }

      if (saveTokens && context?.visitor === "human" && !context.environmentFlag) {
        return {
          value: { success: false, skipped: true },
          codes: [],
        }
      }

      try {
        await injectScript()
      } catch {
        return {
          value: { success: false },
          codes: [91.2],
        }
      }

      const container = document.createElement("div")
      container.style.display = "none"
      document.body.appendChild(container)

      let widgetId: string
      try {
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          execution: "execute",
          appearance,
        })
      } catch {
        document.body.removeChild(container)
        return {
          value: { success: false },
          codes: [91.2],
        }
      }

      let token: string
      try {
        token = await new Promise<string>((resolve, reject) => {
          const widgetEl = container
          turnstile.execute(widgetEl)

          const checkToken = () => {
            const input = container.querySelector("input[name='cf-turnstile-response']") as HTMLInputElement
            if (input?.value) {
              resolve(input.value)
              return
            }
            setTimeout(checkToken, 100)
          }
          setTimeout(checkToken, 500)

          setTimeout(() => reject(new Error("Turnstile timeout")), 15000)
        })
      } catch {
        turnstile.remove(widgetId)
        document.body.removeChild(container)
        return {
          value: { success: false },
          codes: [91.2],
        }
      }

      turnstile.remove(widgetId)
      document.body.removeChild(container)

      let data: { success: boolean }
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        data = await response.json()
      } catch {
        return {
          value: { success: false },
          codes: [91.2],
        }
      }

      if (!data.success) {
        return {
          value: { success: false },
          codes: [91.1],
        }
      }

      return {
        value: { success: true },
        codes: [],
      }
    },
  }
}
