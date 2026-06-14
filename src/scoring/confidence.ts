import type { SignalResult } from "../types/index.js"

export function calculateConfidence(
  signals: SignalResult[],
  score: number,
): number {
  const totalSignals = signals.length
  if (totalSignals === 0) return 0

  const detectedSignals = signals.filter(s => s.detected).length
  const detectionRate = detectedSignals / totalSignals

  const avgWeight =
    signals.filter(s => s.detected).reduce((sum, s) => sum + s.weight, 0) /
    Math.max(detectedSignals, 1)

  const scoreFactor = score / 100

  const confidence =
    (1 - detectionRate) * 0.4 +
    (1 - avgWeight / 100) * 0.3 +
    scoreFactor * 0.3

  return Math.round(Math.max(0, Math.min(100, confidence * 100)))
}
