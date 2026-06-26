import type { Plugin, PluginContext, HardwareOptions } from "../types/index.js"
import { getReferrer } from "../utils/referrer.js"

function classifyProfile(cores: number, memory: number | null): string {
  if (cores <= 2 && memory === 8) return "vm-like"
  if (cores <= 4 && (memory === null || memory <= 4)) return "low-end"
  if (cores >= 8 && memory !== null && memory >= 8) return "high-end"
  return "mid-range"
}

export function hardwarePlugin(options: HardwareOptions = {}): Plugin {
  const { referrer: referrerFilter } = options

  return {
    name: "hardware",

    fn: async (context?: PluginContext) => {
      const currentReferrer = getReferrer()

      if (currentReferrer === "file" || currentReferrer === "localhost") {
        return {
          value: { skipped: true },
          codes: [],
        }
      }

      if (referrerFilter && currentReferrer !== referrerFilter) {
        return {
          value: { skipped: true },
          codes: [],
        }
      }

      const hardwareConcurrency = navigator.hardwareConcurrency ?? null
      const deviceMemory = (navigator as unknown as Record<string, unknown>).deviceMemory as number | undefined ?? null

      const codes: (string | number)[] = []

      if (hardwareConcurrency === null) {
        codes.push(92.1)
        return {
          value: {
            hardwareConcurrency: null,
            deviceMemory,
            profile: "unknown",
          },
          codes,
        }
      }

      const profile = classifyProfile(hardwareConcurrency, deviceMemory)

      if (profile === "vm-like") {
        codes.push(92.2)
      }

      return {
        value: {
          hardwareConcurrency,
          deviceMemory,
          profile,
        },
        codes,
      }
    },
  }
}
