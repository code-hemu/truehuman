import type { CheckCategory } from "./registry.js"

export type { CheckCategory }

export type CheckStatus = "pass" | "suspicious" | "fail"

export type OutputMode = "minimal" | "detailed" | "debug"

export interface CheckEvidence {
  detector: string
  message: string
  code: number | string
}

export interface CheckResult {
  name: CheckCategory
  status: CheckStatus
  riskDelta: number
  evidence: CheckEvidence[]
}

export interface DebugInfo {
  integrityCodes: (string | number)[]
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}

export interface AnalyzeResult {
  verdict: "human" | "suspicious" | "bot"
  isHuman: boolean
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  confidence: number
  checks: CheckResult[] | { passed: number; suspicious: number; failed: number }
  debug?: DebugInfo
}
