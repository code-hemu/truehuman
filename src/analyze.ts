import type { AnalyzeMode } from "./types/index.js"
import type { AnalyzeResult } from "./types/index.js"
import { createSandboxedIframe, cleanupIframe } from "./utils/helpers.js"
import { checkEnvironment, checkUserAgent, checkEssentialApis, checkNavigation, checkDocumentIntegrity, checkNavigatorIntegrity, checkDateIntegrity, checkStorage } from "./detectors/headless.js"
import { computeScreenNN, checkScreenHeuristics, checkScreenIntegrity } from "./detectors/screen.js"
import { checkAutomation, checkBrowserFlags } from "./detectors/webdriver.js"
import { checkIframeElementIntegrity } from "./detectors/iframe.js"
import { checkWebglIntegrity } from "./detectors/webgl.js"
import { checkCanvasPrototypes, checkCanvasFingerprint } from "./detectors/canvas.js"
import { score, buildPublicResponse } from "./scoring/risk.js"

export function analyze(mode: AnalyzeMode = "public"): AnalyzeResult {
  const errors: number[] = []
  const comparisons: boolean[] = []
  let environmentFlag: boolean | null = null
  let direct = false
  const integritychecks: (string | number)[] = []

  const iframe = createSandboxedIframe()
  if (!iframe) {
    errors.push(0)
  }

  try {
    if (checkEnvironment()) {
      environmentFlag = true
      direct = true
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
    const nnScore = computeScreenNN(
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
    try {
      integritychecks.push(...checkDocumentIntegrity(iframe, comparisons))
    } catch {
      errors.push(30)
    }

    try {
      integritychecks.push(...checkNavigatorIntegrity(iframe, comparisons))
    } catch {
      errors.push(31)
    }

    try {
      integritychecks.push(...checkScreenIntegrity())
    } catch {
      errors.push(32)
    }

    try {
      integritychecks.push(...checkDateIntegrity(iframe, comparisons))
    } catch {
      errors.push(33)
    }

    try {
      integritychecks.push(...checkIframeElementIntegrity(iframe))
    } catch {
      errors.push(34)
    }

    try {
      checkWebglIntegrity(iframe, comparisons, integritychecks)
    } catch {
      errors.push(35)
    }

    try {
      checkCanvasPrototypes(integritychecks)
    } catch {
      errors.push(35)
    }

    try {
      integritychecks.push(...checkCanvasFingerprint())
    } catch {
      errors.push(47)
    }
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

  const { checks, verdict, human, riskScore, riskLevel, confidence } = score(
    integritychecks,
    comparisons,
    environmentFlag,
    errors,
  )

  const result: AnalyzeResult = {
    verdict,
    human,
    direct,
    riskScore,
    riskLevel,
    confidence,
    checks: mode === "public" ? buildPublicResponse(checks) : checks,
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
