import { lookupCode, type CheckCategory, type RegistryEntry } from "./registry.js"
import type { CheckEvidence, CheckResult, CheckStatus } from "./types.js"

const ALL_CATEGORIES: CheckCategory[] = [
  "automation",
  "browser_integrity",
  "iframe_integrity",
  "fingerprinting",
  "behavioral",
]

interface DecodedSignals {
  evidence: Map<CheckCategory, CheckEvidence[]>
  riskScore: number
}

function decodeSignals(
  integritychecks: (string | number)[],
  comparisons: boolean[],
  environmentFlag: boolean | null,
  errors: number[],
): DecodedSignals {
  const evidence = new Map<CheckCategory, CheckEvidence[]>()
  let riskScore = 0

  for (const category of ALL_CATEGORIES) {
    evidence.set(category, [])
  }

  for (const code of integritychecks) {
    const entry = lookupCode(code)
    if (entry) {
      evidence.get(entry.category)!.push({
        detector: entry.detector,
        message: entry.message,
        code,
      })
      riskScore += entry.riskDelta
    }
  }

  if (errors.length > 0) {
    evidence.get("browser_integrity")!.push({
      detector: "pipeline",
      message: `${errors.length} runtime error(s) during analysis`,
      code: errors[0],
    })
    riskScore += Math.min(errors.length * 8, 20)
  }

  if (environmentFlag === true) {
    evidence.get("browser_integrity")!.push({
      detector: "environment",
      message: "Direct file open detected",
      code: 0,
    })
    riskScore += 30
  }

  const trueCount = comparisons.filter(Boolean).length
  if (trueCount > 0) {
    evidence.get("iframe_integrity")!.push({
      detector: "comparison",
      message: `${trueCount} iframe comparison(s) returned different values`,
      code: Number(`50.${comparisons.indexOf(true) + 1}`),
    })
    riskScore += Math.min(trueCount * 15, 30)
  }

  const activeCategories = [...evidence.entries()].filter(([, v]) => v.length > 0)
  if (activeCategories.length > 1) {
    riskScore += (activeCategories.length - 1) * 5
  }

  riskScore = Math.min(riskScore, 100)

  return { evidence, riskScore }
}

function computeVerdict(riskScore: number): { verdict: "human" | "suspicious" | "bot"; isHuman: boolean; riskLevel: "low" | "medium" | "high" | "critical"; confidence: number } {
  const verdict = riskScore <= 15 ? "human" as const : riskScore <= 50 ? "suspicious" as const : "bot" as const
  const riskLevel = riskScore <= 15 ? "low" as const : riskScore <= 40 ? "medium" as const : riskScore <= 70 ? "high" as const : "critical" as const
  const confidence = Math.round((100 - riskScore) * 100) / 100
  return {
    verdict,
    isHuman: verdict === "human",
    riskLevel,
    confidence,
  }
}

function buildDetailedChecks(evidence: Map<CheckCategory, CheckEvidence[]>): CheckResult[] {
  const results: CheckResult[] = []
  for (const category of ALL_CATEGORIES) {
    const categoryEvidence = evidence.get(category)!
    const totalRiskDelta = categoryEvidence.reduce((sum, e) => sum + (lookupCode(e.code)?.riskDelta ?? 0), 0)
    const status: CheckStatus = categoryEvidence.length === 0 ? "pass" : totalRiskDelta > 30 ? "fail" : "suspicious"
    results.push({
      name: category,
      status,
      riskDelta: totalRiskDelta,
      evidence: categoryEvidence,
    })
  }
  return results
}

function buildMinimalChecks(checks: CheckResult[]): { passed: number; suspicious: number; failed: number } {
  let passed = 0
  let suspicious = 0
  let failed = 0
  for (const c of checks) {
    if (c.status === "pass") passed++
    else if (c.status === "fail") failed++
    else suspicious++
  }
  return { passed, suspicious, failed }
}

export interface ScoreResult {
  verdict: "human" | "suspicious" | "bot"
  isHuman: boolean
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  confidence: number
  checks: CheckResult[]
}

export function score(
  integritychecks: (string | number)[],
  comparisons: boolean[],
  environmentFlag: boolean | null,
  errors: number[],
): ScoreResult {
  const { evidence, riskScore } = decodeSignals(integritychecks, comparisons, environmentFlag, errors)
  const verdictInfo = computeVerdict(riskScore)
  const detailedChecks = buildDetailedChecks(evidence)

  return {
    ...verdictInfo,
    riskScore,
    checks: detailedChecks,
  }
}

export function buildMinimalResponse(checks: CheckResult[]): { passed: number; suspicious: number; failed: number } {
  return buildMinimalChecks(checks)
}
