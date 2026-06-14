import type { SignalResult } from "../types/index.js"

const win = window as unknown as Record<string, unknown>
const hasChrome = typeof (win.chrome as unknown) !== "undefined"

export function detectScreen(): SignalResult {
  const details: Record<string, unknown> = {}
  let detected = false
  let score = 0

  const sw = screen.width
  const sh = screen.height
  const saw = screen.availWidth
  const sah = screen.availHeight
  const iw = window.innerWidth
  const ih = window.innerHeight
  const ow = window.outerWidth
  const oh = window.outerHeight
  const st = window.screenTop ?? window.screenY ?? 0
  const sl = window.screenLeft ?? window.screenX ?? 0
  const validS = sw > 0 && sh > 0
  const validB = iw > 0 && ih > 0 && ow > 0 && oh > 0

  details.dimensions = { sw, sh, saw, sah, iw, ih, ow, oh, st, sl }

  if (!validS) {
    detected = true
    score += 20
    details.zeroScreen = true
  }

  const deltaFrame = oh - ih
  if (deltaFrame === 132 || deltaFrame === 133) {
    detected = true
    score += 15
    details.chromeDevToolsDelta = true
  }

  const margin = Math.abs(st) > 0 || Math.abs(sl) > 0 ? 1 : 0
  if (margin > 0) {
    score += 10
    details.windowOffset = { top: st, left: sl }
  }

  if (window !== window.top) {
    detected = true
    score += 15
    details.inIframe = true
  }

  if (hasChrome && navigator.maxTouchPoints === 0) {
    if (
      window.screenTop === 0 &&
      document.hasFocus() &&
      document.visibilityState === "visible"
    ) {
      if (sw === saw && sh === sah) {
        detected = true
        score += 15
        details.fullScreenNoChrome = true
      }
    }
  }

  if (navigator.maxTouchPoints === 0) {
    if (sw < 350 || sh < 350) {
      detected = true
      score += 10
      details.tinyScreenNoTouch = true
    }
  }

  const screenProps = ["width", "height", "orientation"]
  for (const prop of screenProps) {
    if (Object.getOwnPropertyDescriptor(screen, prop) !== undefined) {
      score += 5
      details[`screen_${prop}_directOverride`] = true
    }
    const desc = Object.getOwnPropertyDescriptor(Screen.prototype, prop)
    if (desc?.get && !desc.get.toString().includes("[native code]")) {
      detected = true
      score += 8
      details[`screen_${prop}_nonNative`] = true
    }
  }

  if (hasChrome || navigator.userAgent.includes("Win")) {
    if (!window.matchMedia("(display-mode:fullscreen)").matches) {
      if (sh === ih && ih === oh) {
        detected = true
        score += 10
        details.innerEqualsOuterHeight = true
      }
    }
  }

  if (
    screen.orientation?.type?.includes("landscape") &&
    sw < sh
  ) {
    detected = true
    score += 8
    details.orientationMismatch = true
  }

  const features = extractScreenFeatures(
    sw, sh, iw, ih, ow, oh, st, sl, margin, validS, validB,
  )
  const nnScore = neuralNetScore(features)
  if (nnScore > 0.3) {
    detected = true
    score += 20
    details.neuralNetScore = nnScore
  }

  if (!validB) {
    score += 10
    details.invalidBrowserWindow = true
  }

  const weight = Math.min(score, 100)
  return {
    name: "screen",
    detected,
    suspicious: false,
    weight,
    riskDelta: detected ? weight : 0,
    details: Object.keys(details).length > 0 ? details : undefined,
  }
}

interface ScreenFeatures {
  sw: number
  sh: number
  iw: number
  ih: number
  ow: number
  oh: number
  st: number
  sl: number
  margin: number
  validB: boolean

  ratio: number
  area: number
  circum: number
  vector: number

  iarea: number
  icircum: number
  ivector: number

  oarea: number
  ocircum: number
  ovector: number
  oratio: number

  stamp: number
  zone: number
  chrome: number
  mobile: number
  visible: number
}

function extractScreenFeatures(
  sw: number,
  sh: number,
  iw: number,
  ih: number,
  ow: number,
  oh: number,
  st: number,
  sl: number,
  margin: number,
  validS: boolean,
  validB: boolean,
): ScreenFeatures {
  const sd = Math.max(sw, sh)
  const md = Math.max(iw, ih)
  const od = Math.max(ow, oh)

  const ratio = validS ? Math.min(sw, sh) / Math.max(sw, sh) : 1
  const area = validS ? (sw * sh) / (sd * sd) : 1
  const circum = validS ? (sw + sh) / (2 * sd) : 1
  const vector = validS
    ? Math.sqrt(sw * sw + sh * sh) / Math.sqrt(2 * sd * sd)
    : 1

  const iarea = validB ? (iw * ih) / (md * md) : 1
  const icircum = validB ? (iw + ih) / (2 * md) : 1
  const ivector = validB
    ? Math.sqrt(iw * iw + ih * ih) / Math.sqrt(2 * md * md)
    : 1

  const oarea = validB ? (ow * oh) / (od * od) : 1
  const ocircum = validB ? (ow + oh) / (2 * od) : 1
  const ovector = validB
    ? Math.sqrt(ow * ow + oh * oh) / Math.sqrt(2 * od * od)
    : 1
  const oratio = validB ? Math.min(ow, oh) / Math.max(ow, oh) : 1

  const stamp = Math.min(performance.now(), 100000) / 100000
  const zone = ((12 + new Date().getTimezoneOffset() / 60) % 12) / 24

  return {
    sw, sh, iw, ih, ow, oh, st, sl, margin, validB,
    ratio, area, circum, vector,
    iarea, icircum, ivector,
    oarea, ocircum, ovector, oratio,
    stamp, zone,
    chrome: hasChrome ? 1 : 0,
    mobile: navigator.maxTouchPoints > 0 ? 1 : 0,
    visible: document.visibilityState === "visible" ? 1 : 0,
  }
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function neuralNetScore(f: ScreenFeatures): number {
  const h = f.sh || f.sw
  const w = f.sw || f.sh

  const v = [
    Math.abs(f.zone),
    Math.abs(f.area),
    Math.abs(f.iarea),
    Math.abs(f.oarea),
    Math.abs(f.stamp),
    Math.abs(f.ratio),
    Math.abs(f.oratio),
    Math.abs(f.vector),
    Math.abs(f.circum),
    Math.abs(f.icircum),
    Math.abs(f.ocircum),
    Math.abs(f.ivector),
    Math.abs(f.ovector),
    Math.abs(f.margin),
    Math.abs(f.area - f.oarea),
    Math.abs(f.oarea - f.iarea),
    Math.abs(f.circum - f.ocircum),
    Math.abs(f.ocircum - f.icircum),
    Math.abs(f.ovector - f.ivector),
    Math.abs(Math.atan(f.ratio)) / Math.PI,
    Math.abs(Math.atan(f.oratio)) / Math.PI,
    Math.abs(f.chrome + f.visible + f.mobile) / 3,
    Math.abs(Math.atan(f.ratio) - Math.atan(f.oratio)) / Math.PI,
    f.validB
      ? Math.abs((f.ow - f.iw) / Math.max(f.iw, f.ow))
      : 1,
    f.validB
      ? Math.abs((f.oh - f.ih) / Math.max(f.ih, f.oh))
      : 1,
    Math.abs(
      Math.min(f.oarea, f.area) / Math.max(f.oarea, f.area),
    ),
    Math.abs(
      Math.min(f.ratio, f.oratio) / Math.max(f.ratio, f.oratio),
    ),
    Math.abs(
      Math.min(f.iarea, f.oarea) / Math.max(f.iarea, f.oarea),
    ),
    Math.abs(
      Math.min(f.ocircum, f.circum) /
        Math.max(f.ocircum, f.circum),
    ),
    Math.abs(
      Math.min(f.vector, f.ovector) /
        Math.max(f.vector, f.ovector),
    ),
    Math.abs(
      Math.min(f.ivector, f.ovector) /
        Math.max(f.ivector, f.ovector),
    ),
    Math.abs(
      Math.min(f.icircum, f.ocircum) /
        Math.max(f.icircum, f.ocircum),
    ),
    Math.abs(
      Math.min(Math.abs(f.st), h) / Math.max(Math.abs(f.st), h),
    ),
    Math.abs(
      Math.min(Math.abs(f.sl), w) / Math.max(Math.abs(f.sl), w),
    ),
    Math.abs(
      Math.min(Math.abs(f.st + f.ih), w) /
        Math.max(Math.abs(f.st + f.ih), w),
    ),
    Math.abs(
      Math.min(Math.abs(f.st + f.oh), w) /
        Math.max(Math.abs(f.st + f.oh), w),
    ),
    Math.abs(
      Math.min(Math.abs(f.sl + f.iw), w) /
        Math.max(Math.abs(f.sl + f.iw), w),
    ),
    Math.abs(
      Math.min(Math.abs(f.sl + f.ow), w) /
        Math.max(Math.abs(f.sl + f.ow), w),
    ),
    f.margin
      ? Math.abs(
          Math.min(Math.abs(f.st), Math.abs(f.sl)) /
            Math.max(Math.abs(f.st), Math.abs(f.sl)),
        )
      : 1,
  ]

  const hidden1 = sigmoid(
    -2.8136587142944336 -
      4.606883525848389 * v[0] +
      1.489404559135437 * v[1] -
      0.1096208468079567 * v[2] -
      0.7542693614959717 * v[3] +
      0.4133126437664032 * v[4] +
      1.3309131860733032 * v[5] -
      1.0260473489761353 * v[6] +
      3.7896251678466797 * v[7] -
      0.763090968132019 * v[8] -
      1.5962871313095093 * v[9] -
      2.0260324478149414 * v[10] +
      6.823464393615723 * v[11] -
      7.598196506500244 * v[12] +
      2.6539254188537598 * v[13] -
      0.7449193000793457 * v[14] -
      5.232008934020996 * v[15] -
      0.6193847060203552 * v[16] -
      2.7787818908691406 * v[17] -
      3.924647569656372 * v[18] -
      2.193755626678467 * v[19] +
      1.9640344381332397 * v[20] -
      0.16138172149658203 * v[21] +
      6.73677921295166 * v[22] -
      4.909875869750977 * v[23] +
      3.7674999237060547 * v[24] -
      6.364192008972168 * v[25] -
      6.360919952392578 * v[26] -
      2.9175071716308594 * v[27] -
      3.492058515548706 * v[28] +
      6.736382961273193 * v[29] +
      1.0437698364257812 * v[30] -
      0.43294891715049744 * v[31] -
      16.655624389648438 * v[32] -
      26.502634048461914 * v[33] +
      13.393714904785156 * v[34] -
      6.492252826690674 * v[35] +
      0.34316286444664 * v[36] +
      4.564265727996826 * v[37] +
      4.738802909851074 * v[38],
  )

  const hidden2 = sigmoid(
    2.00228214263916 - 20.34248161315918 / hidden1,
  )

  const result = sigmoid(
    7.48822021484375 - 9.730072021484375 / hidden2,
  )

  return isNaN(result) ? 0 : result
}
