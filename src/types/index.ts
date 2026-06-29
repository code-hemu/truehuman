export type CheckComponent = "audioBaseLatency" | "canvas" | "document" | "essentialApis" | "fonts" | "fontPreferences" | "forcedColors" | "hardware" | "iframe" | "invertedColors" | "navigation" | "navigator" | "plugins" | "prototype" | "recaptcha" | "screen" | "screenMeta" | "storage" | "timezone" | "turnstile" | "userAgent" | "webDriver" | "webgl"
export type CheckStatus = "pass" | "suspicious" | "fail"
export type AnalyzeMode = "public" | "debug"

export interface CheckEvidence {
  detector: string
  message?: string
  code: number | string
}

export interface ComponentEntry {
  duration: number
  value: any
}

export interface DebugInfo {
  integrityCodes: (string | number)[]
  iframeComparisons: number
  environmentFlag: boolean | null
  errors: number[]
}

export interface AnalyzeResult {
  visitorId: string
  referrer: "direct" | "internal" | "external" | "file" | "localhost"
  visitor: "human" | "suspicious" | "bot"
  risk: {
    score: number
    level: "low" | "medium" | "high" | "critical"
  }
  confidence: number
  components: Partial<Record<CheckComponent, ComponentEntry>>
  debug?: DebugInfo
}

export interface RegistryEntry {
  component: CheckComponent
  detector: string
  risk: number
}

export interface PluginResult {
  codes?: (string | number)[]
  value?: unknown
  duration?: number
}

export interface PluginContext {
  integritychecks: (string | number)[]
  errors: number[]
  visitor?: string
  environmentFlag?: boolean
}

export type PluginFn = (context?: PluginContext) => PluginResult | Promise<PluginResult>

export interface Plugin {
  name: string
  fn: PluginFn
}

export interface RecaptchaOptions {
  siteKey: string
  action?: string
  endpoint: string
  threshold?: number
  saveTokens?: boolean
}

export interface TurnstileOptions {
  siteKey: string
  endpoint: string
  appearance?: "always" | "execute" | "interaction-only"
  saveTokens?: boolean
}

export interface HardwareOptions {}

export interface AnalyzeOptions {
  mode?: AnalyzeMode
  plugins?: Plugin[]
}
