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
    4.738802909851074 * v[38]

  const ws2 =
    -3.544931411743164 +
    19.6558780670166 * v[0] -
    0.5593536496162415 * v[1] +
    6.193645000457764 * v[2] -
    1.0189863443374634 * v[3] +
    2.45023250579834 * v[4] -
    0.3582189381122589 * v[5] -
    1.2700327634811401 * v[6] -
    3.3441786766052246 * v[7] -
    2.1276559829711914 * v[8] +
    1.3821078538894653 * v[9] -
    2.540404796600342 * v[10] +
    1.230239748954773 * v[11] -
    1.8368293046951294 * v[12] +
    11.337075233459473 * v[13] +
    13.533642768859863 * v[14] -
    0.09079886227846146 * v[15] +
    6.914908409118652 * v[16] +
    0.09952732175588608 * v[17] -
    0.0006935351411812007 * v[18] +
    0.15431442856788635 * v[19] -
    1.1282325983047485 * v[20] -
    0.023381400853395462 * v[21] +
    0.6609017252922058 * v[22] -
    6.789743900299072 * v[23] +
    8.712202072143555 * v[24] -
    4.430511951446533 * v[25] -
    4.568970680236816 * v[26] +
    1.5294157266616821 * v[27] -
    9.253304481506348 * v[28] -
    15.027138710021973 * v[29] -
    3.8801212310791016 * v[30] -
    3.7249860763549805 * v[31] -
    0.6425716280937195 * v[32] +
    30.13886833190918 * v[33] +
    16.779417037963867 * v[34] -
    8.915738105773926 * v[35] +
    11.26508903503418 * v[36] +
    13.927120208740234 * v[37] +
    16.37605094909668 * v[38]

  const h1 = sigmoid(ws1)
  const h2 = sigmoid(ws2)

  const a = sigmoid(2.00228214263916 - 20.34248161315918 / h1)
  const b = sigmoid(4.032938003540039 / h1 - 0.09353494644165039 - 1.064182996749878 / h2)

  const result = sigmoid(
    7.48822021484375 -
      9.730072021484375 / a +
      14.987696647644043 / h2 +
      2.062284231185913 / b,
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

export function checkScreenHeuristics(): (string | number)[] {
  const codes: (string | number)[] = []

  try {
    if (window.matchMedia("(display-mode:fullscreen)").matches === false) {
      const isChrome = typeof (globalThis as Record<string, unknown>).chrome !== "undefined"
      const isWin = navigator.userAgent.indexOf("Win") !== -1
      if (isChrome || isWin) {
        const shEqualsIh = screen.height === window.innerHeight
        const ihEqualsOh = window.innerHeight === window.outerHeight
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

  try {
    const checks: boolean[] = []
    checks.push(screen.width === 0 || screen.height === 0)
    checks.push(
      screen.orientation.type.match(/landscape/) !== null &&
        screen.width < screen.height,
    )
    const idx = checks.indexOf(true)
    if (idx !== -1) {
      codes.push("43.5." + (idx + 1))
    }
  } catch {
    // ignore
  }

  return codes
}

export function checkScreenIntegrity(): (string | number)[] {
  const codes: (string | number)[] = []

  const props = ["width", "height", "orientation"]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(screen, props[i]) !== undefined
    ) {
      codes.push("32.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(Screen.prototype, props[i])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("32.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("32.3." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("32.4." + (i + 1))
      }
    }
  }

  return codes
}
