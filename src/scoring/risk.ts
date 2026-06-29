declare var __DEV__: boolean

import type { CheckComponent, CheckEvidence } from "../types/index.js"
import { lookupCode } from "../lookup/codes.js"
import { lookupMessage } from "../lookup/messages.js"
import { computeVerdict, type VisitorResult } from "./confidence.js"

const ALL_COMPONENTS: CheckComponent[] = [
  "audioBaseLatency",
  "canvas",
  "document",
  "essentialApis",
  "fonts",
  "fontPreferences",
  "forcedColors",
  "plugins",
  "hardware",
  "iframe",
  "invertedColors",
  "screen",
  "screenMeta",
  "webgl",
  "webDriver",
  "prototype",
  "storage",
  "userAgent",
  "navigator",
  "timezone",
  "navigation"
]

interface DecodedSignals {
  evidence: Map<CheckComponent, CheckEvidence[]>
  riskScore: number
}

function decodeSignals(
  integritychecks: (string | number)[],
  comparisons: boolean[],
  environmentFlag: boolean | null,
  errors: number[],
): DecodedSignals {
  const evidence = new Map<CheckComponent, CheckEvidence[]>()
  let riskScore = 0

  for (const component of ALL_COMPONENTS) {
    evidence.set(component, [])
  }

  for (const code of integritychecks) {
    const entry = lookupCode(code)
    if (entry) {
      evidence.get(entry.component)!.push({
        detector: entry.detector,
        ...(__DEV__ ? { message: lookupMessage(code) ?? "" } : {}),
        code,
      })
      riskScore += entry.risk
    }
  }

  if (errors.length > 0) {
    riskScore += Math.min(errors.length * 8, 20)
  }

  const trueCount = comparisons.filter(Boolean).length
  if (trueCount > 0) {
    evidence.get("iframe")!.push({
      detector: "comparison",
      ...(__DEV__ ? { message: `${trueCount} iframe comparison(s) returned different values` } : {}),
      code: Number(`50.${comparisons.indexOf(true) + 1}`),
    })
    riskScore += Math.min(trueCount * 15, 30)
  }

  const activeComponents = [...evidence.entries()].filter(([, v]) => v.length > 0)
  if (activeComponents.length > 1) {
    riskScore += (activeComponents.length - 1) * 5
  }

  riskScore = Math.min(riskScore, 100)

  return { evidence, riskScore }
}

export interface ScoreResult {
  visitor: "human" | "suspicious" | "bot"
  risk: {
    score: number
    level: "low" | "medium" | "high" | "critical"
  }
  confidence: number
  components: Record<string, { duration: number; value: unknown }>
}

export function score(
  integritychecks: (string | number)[],
  comparisons: boolean[],
  environmentFlag: boolean | null,
  errors: number[],
  componentMeta?: Map<CheckComponent, { duration: number; value: unknown }>,
): ScoreResult {
  const { evidence, riskScore } = decodeSignals(integritychecks, comparisons, environmentFlag, errors)
  const visitorInfo: VisitorResult = computeVerdict(riskScore)

  const components: Record<string, { duration: number; value: unknown }> = {}

  for (const component of ALL_COMPONENTS) {
    const meta = componentMeta?.get(component)
    components[component] = {
      duration: meta?.duration ?? 0,
      value: meta?.value ?? 0,
    }
  }

  if (componentMeta) {
    for (const [component, meta] of componentMeta) {
      if (!components[component]) {
        components[component] = {
          duration: meta.duration,
          value: meta.value,
        }
      }
    }
  }

  return {
    ...visitorInfo,
    risk: { score: riskScore, ...visitorInfo.risk },
    components,
  }
}
