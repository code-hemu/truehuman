export type RiskLevel = "low" | "medium" | "high"

export type SignalName =
  | "webdriver"
  | "headless"
  | "iframe"
  | "webgl"
  | "canvas"
  | "screen"
  | "audio"
  | "integrity"
  | "performance"

export interface SignalResult {
  name: SignalName
  detected: boolean
  suspicious: boolean
  weight: number
  riskDelta: number
  details?: Record<string, unknown>
}

export interface HumanResult {
  human: boolean
  score: number
  risk: RiskLevel
  fingerprint: string
  signals: SignalName[]
}
