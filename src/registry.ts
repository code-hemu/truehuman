import type { CheckComponent } from "./types/index.js"
import { checkUserAgent, checkEssentialApis, checkNavigation, checkDocumentIntegrity, checkNavigatorIntegrity, checkDateIntegrity } from "./detectors/headless.js"
import { checkScreenHeuristics, checkScreenIntegrity } from "./detectors/screen.js"
import { checkAutomation } from "./detectors/webdriver.js"
import { checkIframeElementIntegrity } from "./detectors/iframe.js"
import { checkWebglIntegrity } from "./detectors/webgl.js"
import { checkPrototypes } from "./detectors/prototypes.js"
import { checkCanvasFingerprint } from "./detectors/canvas.js"

export interface DetectorEntry {
  component: CheckComponent
  errorCode: number
  needsIframe?: boolean
  needsComparisons?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => { value: unknown; codes: (string | number)[] } | null
}

export const DETECTOR_REGISTRY: DetectorEntry[] = [
  { fn: checkUserAgent,              component: "headless",  errorCode: 10, needsIframe: true, needsComparisons: true },
  { fn: checkEssentialApis,          component: "headless",  errorCode: 11 },
  { fn: checkNavigation,             component: "headless",  errorCode: 20 },
  { fn: checkDocumentIntegrity,      component: "headless",  errorCode: 30, needsIframe: true, needsComparisons: true },
  { fn: checkNavigatorIntegrity,     component: "headless",  errorCode: 31, needsIframe: true, needsComparisons: true },
  { fn: checkScreenIntegrity,        component: "screen",    errorCode: 32 },
  { fn: checkDateIntegrity,          component: "headless",  errorCode: 33, needsIframe: true, needsComparisons: true },
  { fn: checkIframeElementIntegrity, component: "iframe",    errorCode: 34, needsIframe: true },
  { fn: checkWebglIntegrity,         component: "webgl",     errorCode: 35, needsIframe: true, needsComparisons: true },
  { fn: checkPrototypes,             component: "prototype", errorCode: 35 },
  { fn: checkAutomation,             component: "webdriver", errorCode: 40, needsIframe: true },
  { fn: checkScreenHeuristics,       component: "screen",    errorCode: 43 },
  { fn: checkCanvasFingerprint,      component: "canvas",    errorCode: 47 },
]
