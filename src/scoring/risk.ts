import type { SignalResult, RiskLevel } from "../types/index.js"

export function calculateRisk(signals: SignalResult[]): {
  score: number
  risk: RiskLevel
} {
  const totalDelta = signals.reduce((sum, s) => sum + s.riskDelta, 0)
  const score = Math.max(0, Math.min(100, Math.round(100 - totalDelta)))

  const risk: RiskLevel =
    score >= 70 ? "low" : score >= 40 ? "medium" : "high"

  return { score, risk }
}
