import type { OutputMode } from "./types.js"
import { createSandboxedIframe, cleanupIframe } from "../support/iframe.js"
import { checkEnvironment } from "../detectors/environment.js"
import { checkUserAgent } from "../detectors/user-agent.js"
import { checkEssentialApis } from "../detectors/essential-apis.js"
import { checkNavigation } from "../detectors/navigation.js"
import { computeNeuralScore } from "../models/screen-neural.js"
import { runIntegrityChecks } from "../integrity/index.js"
import { checkAutomation } from "../detectors/automation.js"
import { checkScreenHeuristics } from "../detectors/screen.js"
import { checkBrowserFlags } from "../detectors/browser-flags.js"
import { checkStorage } from "../detectors/storage.js"
import { score, buildMinimalResponse } from "./scoring.js"
import type { AnalyzeResult } from "./types.js"

export function analyze(mode: OutputMode = "minimal"): AnalyzeResult {
  const errors: number[] = []
  const comparisons: boolean[] = []
  let environmentFlag: boolean | null = null
  const integritychecks: (string | number)[] = []

  const iframe = createSandboxedIframe()
  if (!iframe) {
    errors.push(0)
  }

  try {
    if (checkEnvironment()) {
      environmentFlag = true
    }
  } catch {
    // no error push in original
  }

  try {
    if (iframe) {
      integritychecks.push(...checkUserAgent(iframe, comparisons))
    }
  } catch {
    errors.push(10)
  }

  try {
    integritychecks.push(...checkEssentialApis())
  } catch {
    errors.push(11)
  }

  try {
    integritychecks.push(...checkNavigation())
  } catch {
    errors.push(20)
  }

  try {
    const nnScore = computeNeuralScore(
      screen.width,
      screen.height,
      window.innerWidth,
      window.innerHeight,
      window.outerWidth,
      window.outerHeight,
      window.screenTop ?? window.screenY ?? 0,
      window.screenLeft ?? window.screenX ?? 0,
      typeof (window as unknown as Record<string, unknown>).chrome !== "undefined",
      navigator.maxTouchPoints,
      document.visibilityState,
      new Date().getTimezoneOffset(),
      performance.now(),
    )
    if (nnScore !== 0 && nnScore !== undefined && nnScore > 0.3) {
      environmentFlag = true
    }
  } catch {
    errors.push(21)
  }

  try {
    integritychecks.push(...runIntegrityChecks(iframe, comparisons, errors))
  } catch {
    // outer integrity catch (empty in original)
  }

  try {
    integritychecks.push(...checkAutomation(iframe))
  } catch {
    errors.push(40)
  }

  try {
    integritychecks.push(...checkScreenHeuristics())
  } catch {
    errors.push(43)
  }

  try {
    integritychecks.push(...checkBrowserFlags())
  } catch {
    errors.push(40)
  }

  const trueIdx = comparisons.indexOf(true)
  if (trueIdx !== -1) {
    integritychecks.push(Number("50." + (trueIdx + 1)))
  }

  cleanupIframe(iframe)

  if (integritychecks.length === 0) {
    integritychecks.push(...checkStorage())
  }

  const { checks, verdict, isHuman, riskScore, riskLevel, confidence } = score(
    integritychecks,
    comparisons,
    environmentFlag,
    errors,
  )

  const result: AnalyzeResult = {
    verdict,
    isHuman,
    riskScore,
    riskLevel,
    confidence,
    checks: mode === "minimal" ? buildMinimalResponse(checks) : checks,
  }

  if (mode === "debug") {
    result.debug = {
      integrityCodes: integritychecks,
      iframeComparisons: comparisons.length,
      environmentFlag,
      errors,
    }
  }

  return result
}
