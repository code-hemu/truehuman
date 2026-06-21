import type { AnalyzeMode } from "./types/index.js"
import type { AnalyzeResult, CheckComponent } from "./types/index.js"
import { createSandboxedIframe, cleanupIframe, measureDuration } from "./utils/helpers.js"
import { checkEnvironment, checkStorage } from "./detectors/headless.js"
import { computeScreenNN } from "./detectors/screen.js"
import { DETECTOR_REGISTRY } from "./registry.js"
import { score } from "./scoring/risk.js"

function addMeta(
  meta: Map<CheckComponent, { duration: number; value: unknown }>,
  comp: CheckComponent,
  duration: number,
  value: unknown,
) {
  const prev = meta.get(comp) ?? { duration: 0, value: 0 }
  prev.duration = Number((prev.duration + duration).toFixed(0))

  if (typeof value === "number") {
    prev.value = (prev.value as number) + value
  } else {
    prev.value = value
  }
  meta.set(comp, prev)
}

export function analyze(mode: AnalyzeMode = "public"): AnalyzeResult {
  const errors: number[] = []
  const comparisons: boolean[] = []
  let environmentFlag: boolean | null = null
  const integritychecks: (string | number)[] = []
  const componentMeta = new Map<CheckComponent, { duration: number; value: unknown }>()

  try {
    if (checkEnvironment()) {
      environmentFlag = true
    }
  } catch {
    // no error push in original
  }

  const iframe = createSandboxedIframe()
  if (!iframe) { errors.push(0) }

  for (const entry of DETECTOR_REGISTRY) {
    try {
      const args: unknown[] = []
      if (entry.needsIframe) args.push(iframe)
      if (entry.needsComparisons) args.push(comparisons)

      const { duration, value: result } = measureDuration(() => entry.fn(...args)) as { duration: number; value: { value: unknown; codes: (string | number)[] } | null }
      if (result) {
        integritychecks.push(...result.codes)
        addMeta(componentMeta, entry.component, duration, result.value)
      }
    } catch {
      errors.push(entry.errorCode)
    }
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

  const trueCount = comparisons.filter(Boolean).length
  if (trueCount > 0) {
    integritychecks.push(Number("50." + (comparisons.indexOf(true) + 1)))
    addMeta(componentMeta, "iframe", 0, trueCount)
  }

  cleanupIframe(iframe)

  if (integritychecks.length === 0) {
    const { duration, value: result } = measureDuration(() => checkStorage())
    integritychecks.push(...result.codes)
    addMeta(componentMeta, "storage", duration, result.value)
  }

  const { verdict, risk, confidence, components } = score(
    integritychecks,
    comparisons,
    environmentFlag,
    errors,
    componentMeta,
  )

  const result: AnalyzeResult = {
    verdict,
    risk,
    confidence,
    components,
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
