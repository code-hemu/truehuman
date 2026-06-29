import type { AnalyzeMode, AnalyzeOptions } from "./types/index.js"
import type { AnalyzeResult, CheckComponent } from "./types/index.js"
import { createSandboxedIframe, cleanupIframe } from "./utils/iframe.js"
import { measureDuration } from "./utils/timing.js"
import { checkEnvironment } from "./utils/referrer.js"
import { checkStorage } from "./detectors/storage.js"
import { computeScreenNN } from "./detectors/screen.js"
import { DETECTOR_REGISTRY } from "./registry.js"
import { score } from "./scoring/risk.js"
import { getReferrer } from "./utils/referrer.js"
import { djb2Hex } from "./utils/hash.js"

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

interface SyncResult {
  integritychecks: (string | number)[]
  comparisons: boolean[]
  environmentFlag: boolean | null
  errors: number[]
  componentMeta: Map<CheckComponent, { duration: number; value: unknown }>
}

function runFeathers(mode: AnalyzeMode): SyncResult {
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

  return { integritychecks, comparisons, environmentFlag, errors, componentMeta }
}

function buildResult(
  raw: SyncResult,
  mode: AnalyzeMode,
): AnalyzeResult {
  const { integritychecks, comparisons, environmentFlag, errors, componentMeta } = raw

  const { visitor, risk, confidence, components } = score(
    integritychecks,
    comparisons,
    environmentFlag,
    errors,
    componentMeta,
  )

  const referrer = environmentFlag === true ? "file" : getReferrer()

  const result: AnalyzeResult = {
    visitorId: djb2Hex(
      ["webgl", "canvas", "userAgent"]
        .filter(k => components[k])
        .map(k => `${k}:${JSON.stringify(components[k].value ?? "")}`)
        .join("|")
    ),
    referrer,
    visitor,
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

export function analyze(): AnalyzeResult
export function analyze(mode: AnalyzeMode): AnalyzeResult
export function analyze(options: AnalyzeOptions): Promise<AnalyzeResult>
export function analyze(options?: AnalyzeMode | AnalyzeOptions): AnalyzeResult | Promise<AnalyzeResult> {
  if (typeof options === "string" || options === undefined) {
    const mode = options ?? "public"
    return buildResult(runFeathers(mode), mode)
  }

  const mode = options.mode ?? "public"
  const raw = runFeathers(mode)

  if (!options.plugins || options.plugins.length === 0) {
    return buildResult(raw, mode)
  }

  return (async () => {
    const { visitor } = score(raw.integritychecks, raw.comparisons, raw.environmentFlag, raw.errors, raw.componentMeta)
    const pluginContext = { integritychecks: raw.integritychecks, errors: raw.errors, visitor, environmentFlag: raw.environmentFlag ?? false }
    for (const plugin of options.plugins!) {
      try {
        const result = await plugin.fn(pluginContext)
        if (!result) continue
        if (result.codes) raw.integritychecks.push(...result.codes)
        if (result.value !== undefined) {
          addMeta(raw.componentMeta, plugin.name as CheckComponent, result.duration ?? 0, result.value)
        }
      } catch {
        raw.integritychecks.push(90.2)
      }
    }
    return buildResult(raw, mode)
  })()
}
