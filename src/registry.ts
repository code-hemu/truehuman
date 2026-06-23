import type { CheckComponent } from "./types/index.js"
import { checkEssentialApis } from "./detectors/windows.js"
import { checkNavigation } from "./detectors/navigation.js"
import { checkUserAgent } from "./detectors/useragent.js"
import { checkNavigatorIntegrity } from "./detectors/navigator.js"
import { checkDateIntegrity } from "./detectors/date.js"
import { checkDocumentIntegrity } from "./detectors/document.js"
import { checkScreenHeuristics, checkScreenIntegrity } from "./detectors/screen.js"
import { checkAutomation } from "./detectors/webdriver.js"
import { checkIframeElementIntegrity } from "./detectors/iframe.js"
import { checkWebglIntegrity } from "./detectors/webgl.js"
import { checkCanvasFingerprint } from "./detectors/canvas.js"
import { checkFonts, checkFontPreferences } from "./detectors/fonts.js"
import { checkPlugins } from "./detectors/plugins.js"
import { checkForcedColors, checkInvertedColors } from "./detectors/colors.js"
import { checkPrototypes } from "./detectors/prototypes.js"
import { checkAudioBaseLatency } from "./detectors/audio.js"

export interface DetectorEntry {
  component: CheckComponent
  errorCode: number
  needsIframe?: boolean
  needsComparisons?: boolean
  fn: (...args: any[]) => { value: unknown; codes: (string | number)[] } | null
}

export const DETECTOR_REGISTRY: DetectorEntry[] = [
  { fn: checkEssentialApis, component: "essentialApis", errorCode: 11 },

  { fn: checkCanvasFingerprint, component: "canvas", errorCode: 47 },

  { fn: checkPrototypes, component: "prototype", errorCode: 35 },

  { fn: checkNavigation, component: "navigation", errorCode: 20 },

  { fn: checkAutomation, component: "webDriver", errorCode: 40, needsIframe: true },

  { fn: checkIframeElementIntegrity, component: "iframe", errorCode: 34, needsIframe: true },

  { fn: checkWebglIntegrity, component: "webgl", errorCode: 36, needsIframe: true, needsComparisons: true },

  { fn: checkUserAgent, component: "userAgent", errorCode: 10, needsIframe: true, needsComparisons: true },

  { fn: checkNavigatorIntegrity, component: "navigator", errorCode: 31, needsIframe: true, needsComparisons: true },

  { fn: checkDateIntegrity, component: "timezone", errorCode: 33, needsIframe: true, needsComparisons: true },

  { fn: checkDocumentIntegrity, component: "document", errorCode: 30, needsIframe: true, needsComparisons: true },

  { fn: checkScreenIntegrity, component: "screen", errorCode: 32 },

  { fn: checkScreenHeuristics, component: "screenMeta", errorCode: 43 },

  { fn: checkFonts, component: "fonts", errorCode: 70 },

  { fn: checkFontPreferences, component: "fontPreferences", errorCode: 71 },

  { fn: checkPlugins, component: "plugins", errorCode: 80 },

  { fn: checkForcedColors, component: "forcedColors", errorCode: 81 },

  { fn: checkAudioBaseLatency, component: "audioBaseLatency", errorCode: 85 },

  { fn: checkInvertedColors, component: "invertedColors", errorCode: 82 },
]