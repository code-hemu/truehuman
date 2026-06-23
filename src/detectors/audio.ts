import { isAndroid, isWebKit } from "../utils/browser.js"

/**
 * Collects the browser's reported audio output latency using
 * AudioContext.baseLatency.
 *
 * References: https://webaudio.github.io/web-audio-api/#dom-audiocontext-baselatency
 */
export function checkAudioBaseLatency(): {
  value: number
  codes: (string | number)[]
} {
  /**
   * baseLatency is primarily evaluated on Android and WebKit
   * where implementation differences provide useful signals.
   */
  if (!isAndroid && !isWebKit) {
    return { value: -2, codes: [] }
  }

  const AC = window.AudioContext

  /**
   * AudioContext is required to expose baseLatency.
   */
  if (!AC) {
    return { value: -1, codes: [85.1] }
  }

  const ctx = new AC()
  const latency = ctx.baseLatency

  /**
   * Close the temporary context immediately after sampling
   * to avoid retaining audio resources.
   */
  ctx.close()

  /**
   * Reject missing, NaN, and infinite values.
   */
  if (latency == null || !isFinite(latency)) {
    return { value: -3, codes: [85.2] }
  }

  return {
    value: latency,
    codes: [],
  }
}