import type { HumanResult, SignalResult, SignalName } from "./types/index.js"
import { detectWebDriver } from "./detectors/webdriver.js"
import { detectHeadless } from "./detectors/headless.js"
import { detectIframe } from "./detectors/iframe.js"
import { detectWebGL } from "./detectors/webgl.js"
import { detectCanvas } from "./detectors/canvas.js"
import { detectScreen } from "./detectors/screen.js"
import { detectPerformance } from "./detectors/performance.js"
import { fingerprintCanvas } from "./fingerprint/canvas.js"
import { fingerprintAudio } from "./fingerprint/audio.js"
import { fingerprintWebGL } from "./fingerprint/webgl.js"
import { calculateRisk } from "./scoring/risk.js"
import { sha256 } from "./utils/hash.js"

export async function analyze(): Promise<HumanResult> {
  const signals: SignalResult[] = [
    detectWebDriver(),
    detectHeadless(),
    detectIframe(),
    detectWebGL(),
    detectCanvas(),
    detectScreen(),
    detectPerformance(),
  ]

  const fpCanvas = fingerprintCanvas()
  const fpAudio = fingerprintAudio()
  const fpWebGL = fingerprintWebGL()
  const raw = [fpCanvas, fpAudio, fpWebGL].filter(Boolean).join("|")
  const fingerprint = raw ? await sha256(raw) : ""

  const { score, risk } = calculateRisk(signals)

  const detectedSignals: SignalName[] = signals
    .filter(s => s.detected || s.suspicious)
    .map(s => s.name)

  return {
    human: score >= 50,
    score,
    risk,
    fingerprint,
    signals: detectedSignals,
  }
}
