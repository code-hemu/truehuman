export interface VisitorResult {
  visitor: "human" | "suspicious" | "bot"
  risk: { level: "low" | "medium" | "high" | "critical" }
  confidence: number
}

export function computeVerdict(riskScore: number): VisitorResult {
  const visitor = riskScore <= 15 ? "human" as const : riskScore <= 50 ? "suspicious" as const : "bot" as const
  const level = riskScore <= 15 ? "low" as const : riskScore <= 40 ? "medium" as const : riskScore <= 70 ? "high" as const : "critical" as const
  const confidence = Math.round((100 - riskScore) * 100) / 100
  return { visitor, risk: { level }, confidence }
}
