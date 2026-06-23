import { isGecko } from "../utils/browser.js"

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function computeNeuralScore(
  sw: number,
  sh: number,
  iw: number,
  ih: number,
  ow: number,
  oh: number,
  st: number,
  sl: number,
  hasChrome: boolean,
  maxTouchPoints: number,
  visibilityState: string,
  timezoneOffset: number,
  performanceNow: number,
): number {
  const validS = sw > 0 && sh > 0
  const validB = iw > 0 && ih > 0 && ow > 0 && oh > 0

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

  const stamp = Math.min(performanceNow, 100000) / 100000
  const zone = ((12 + timezoneOffset / 60) % 12) / 24

  const margin = Math.abs(st) > 0 || Math.abs(sl) > 0 ? 1 : 0
  const chrome = hasChrome ? 1 : 0
  const mobile = maxTouchPoints > 0 ? 1 : 0
  const visible = visibilityState === "visible" ? 1 : 0

  const h = sh || sw
  const w = sw || sh

  const v: number[] = [
    Math.abs(zone),
    Math.abs(area),
    Math.abs(iarea),
    Math.abs(oarea),
    Math.abs(stamp),
    Math.abs(ratio),
    Math.abs(oratio),
    Math.abs(vector),
    Math.abs(circum),
    Math.abs(icircum),
    Math.abs(ocircum),
    Math.abs(ivector),
    Math.abs(ovector),
    Math.abs(margin),
    Math.abs(area - oarea),
    Math.abs(oarea - iarea),
    Math.abs(circum - ocircum),
    Math.abs(ocircum - icircum),
    Math.abs(ovector - ivector),
    Math.abs(Math.atan(ratio)) / Math.PI,
    Math.abs(Math.atan(oratio)) / Math.PI,
    Math.abs(chrome + visible + mobile) / 3,
    Math.abs(Math.atan(ratio) - Math.atan(oratio)) / Math.PI,
    validB ? Math.abs((ow - iw) / Math.max(iw, ow)) : 1,
    validB ? Math.abs((oh - ih) / Math.max(ih, oh)) : 1,
    Math.abs(Math.min(oarea, area) / Math.max(oarea, area)),
    Math.abs(Math.min(ratio, oratio) / Math.max(ratio, oratio)),
    Math.abs(Math.min(iarea, oarea) / Math.max(iarea, oarea)),
    Math.abs(Math.min(ocircum, circum) / Math.max(ocircum, circum)),
    Math.abs(Math.min(vector, ovector) / Math.max(vector, ovector)),
    Math.abs(Math.min(ivector, ovector) / Math.max(ivector, ovector)),
    Math.abs(Math.min(icircum, ocircum) / Math.max(icircum, ocircum)),
    Math.abs(Math.min(Math.abs(st), h) / Math.max(Math.abs(st), h)),
    Math.abs(Math.min(Math.abs(sl), w) / Math.max(Math.abs(sl), w)),
    Math.abs(
      Math.min(Math.abs(st + ih), w) / Math.max(Math.abs(st + ih), w),
    ),
    Math.abs(
      Math.min(Math.abs(st + oh), w) / Math.max(Math.abs(st + oh), w),
    ),
    Math.abs(
      Math.min(Math.abs(sl + iw), w) / Math.max(Math.abs(sl + iw), w),
    ),
    Math.abs(
      Math.min(Math.abs(sl + ow), w) / Math.max(Math.abs(sl + ow), w),
    ),
    margin
      ? Math.abs(
          Math.min(Math.abs(st), Math.abs(sl)) /
            Math.max(Math.abs(st), Math.abs(sl)),
        )
      : 1,
  ]

  const ws1 =
    -2.81366 -
    4.60688 * v[0] +
    1.4894 * v[1] -
    0.10962 * v[2] -
    0.75427 * v[3] +
    0.41331 * v[4] +
    1.33091 * v[5] -
    1.02605 * v[6] +
    3.78963 * v[7] -
    0.76309 * v[8] -
    1.59629 * v[9] -
    2.02603 * v[10] +
    6.82346 * v[11] -
    7.5982 * v[12] +
    2.65393 * v[13] -
    0.74492 * v[14] -
    5.23201 * v[15] -
    0.61938 * v[16] -
    2.77878 * v[17] -
    3.92465 * v[18] -
    2.19376 * v[19] +
    1.96403 * v[20] -
    0.16138 * v[21] +
    6.73678 * v[22] -
    4.90988 * v[23] +
    3.7675 * v[24] -
    6.36419 * v[25] -
    6.36092 * v[26] -
    2.91751 * v[27] -
    3.49206 * v[28] +
    6.73638 * v[29] +
    1.04377 * v[30] -
    0.43295 * v[31] -
    16.6556 * v[32] -
    26.5026 * v[33] +
    13.3937 * v[34] -
    6.49225 * v[35] +
    0.34316 * v[36] +
    4.56427 * v[37] +
    4.7388 * v[38]

  const ws2 =
    -3.54493 +
    19.6559 * v[0] -
    0.55935 * v[1] +
    6.19365 * v[2] -
    1.01899 * v[3] +
    2.45023 * v[4] -
    0.35822 * v[5] -
    1.27003 * v[6] -
    3.34418 * v[7] -
    2.12766 * v[8] +
    1.38211 * v[9] -
    2.5404 * v[10] +
    1.23024 * v[11] -
    1.83683 * v[12] +
    11.3371 * v[13] +
    13.5336 * v[14] -
    0.0908 * v[15] +
    6.91491 * v[16] +
    0.09953 * v[17] -
    0.000694 * v[18] +
    0.15431 * v[19] -
    1.12823 * v[20] -
    0.02338 * v[21] +
    0.6609 * v[22] -
    6.78974 * v[23] +
    8.7122 * v[24] -
    4.43051 * v[25] -
    4.56897 * v[26] +
    1.52942 * v[27] -
    9.2533 * v[28] -
    15.0271 * v[29] -
    3.88012 * v[30] -
    3.72499 * v[31] -
    0.64257 * v[32] +
    30.1389 * v[33] +
    16.7794 * v[34] -
    8.91574 * v[35] +
    11.2651 * v[36] +
    13.9271 * v[37] +
    16.3761 * v[38]

  const h1 = sigmoid(ws1)
  const h2 = sigmoid(ws2)

  const a = sigmoid(2.00228 - 20.3425 / h1)
  const b = sigmoid(4.03294 / h1 - 0.09353 - 1.06418 / h2)

  const result = sigmoid(
    7.48822 -
      9.73007 / a +
      14.9877 / h2 +
      2.06228 / b,
  )

  return isNaN(result) ? 0 : result
}

export function computeScreenNN(
  sw: number,
  sh: number,
  iw: number,
  ih: number,
  ow: number,
  oh: number,
  st: number,
  sl: number,
  hasChrome: boolean,
  maxTouchPoints: number,
  visibilityState: string,
  timezoneOffset: number,
  performanceNow: number,
): number {
  return computeNeuralScore(sw, sh, iw, ih, ow, oh, st, sl, hasChrome, maxTouchPoints, visibilityState, timezoneOffset, performanceNow)
}

export function checkScreenIntegrity(): {
  value: {
    resolution: string
    availResolution: string
    orientation: string
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  const props = ["width", "height", "orientation"]

  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(screen, props[i]) !==
      undefined
    ) {
      codes.push("32.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(
      Screen.prototype,
      props[i],
    )

    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("32.2." + (i + 1))
        }

        if (
          desc.get
            .toString()
            .indexOf("[native code]") === -1
        ) {
          codes.push("32.3." + (i + 1))
        }
      }

      if (
        desc.value &&
        desc.value.toString &&
        desc.value
          .toString()
          .indexOf("[native code]") === -1
      ) {
        codes.push("32.4." + (i + 1))
      }
    }
  }

  return {
    value: {
      resolution: isGecko ? `${0}x${0}` : `${screen.width}x${screen.height}`,
      availResolution: isGecko ? `${0}x${0}` : `${screen.availWidth}x${screen.availHeight}`,
      orientation:
        screen.orientation?.type ?? "unknown",
    },
    codes,
  }
}

export function checkScreenHeuristics(): {
  value: {
    touchPoints: number
    touchEvent: boolean
    touchStart: boolean
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  try {
    if (
      window.matchMedia("(display-mode:fullscreen)").matches ===
      false
    ) {
      const isChrome =
        typeof (
          globalThis as Record<string, unknown>
        ).chrome !== "undefined"

      const isWin =
        navigator.userAgent.indexOf("Win") !== -1

      if (isChrome || isWin) {
        const shEqualsIh =
          screen.height === window.innerHeight

        const ihEqualsOh =
          window.innerHeight === window.outerHeight

        if (shEqualsIh && ihEqualsOh) {
          codes.push(43.2)
        }
      }
    }
  } catch {
    // ignore
  }

  try {
    if (
      navigator.maxTouchPoints === 0 &&
      (screen.width < 350 || screen.height < 350)
    ) {
      codes.push(43.4)
    }
  } catch {
    // ignore
  }

  let touchEvent: boolean
  try {
    document.createEvent('TouchEvent')
    touchEvent = true
  } catch {
    touchEvent = false
  }

  const touchStart = 'ontouchstart' in window

  try {
    const checks: boolean[] = []

    checks.push(
      screen.width === 0 || screen.height === 0,
    )

    checks.push(
      screen.orientation.type.match(/landscape/) !==
        null &&
        screen.width < screen.height,
    )

    const idx = checks.indexOf(true)

    if (idx !== -1) {
      codes.push("43.5." + (idx + 1))
    }
  } catch {
    // ignore
  }

  return {
    value: {
      touchPoints: navigator.maxTouchPoints,
      touchEvent,
      touchStart,
    },
    codes,
  }
}