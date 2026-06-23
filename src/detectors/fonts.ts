const testString = "mmMwWLliI0O&1"
const textSize = "48px"
const baseFonts = ["monospace", "sans-serif", "serif"]

const fontList = [
  "sans-serif-thin",
  "ARNO PRO",
  "Agency FB",
  "Arabic Typesetting",
  "Arial Unicode MS",
  "AvantGarde Bk BT",
  "BankGothic Md BT",
  "Batang",
  "Bitstream Vera Sans Mono",
  "Calibri",
  "Century",
  "Century Gothic",
  "Clarendon",
  "EUROSTILE",
  "Franklin Gothic",
  "Futura Bk BT",
  "Futura Md BT",
  "GOTHAM",
  "Gill Sans",
  "HELV",
  "Haettenschweiler",
  "Helvetica Neue",
  "Humanst521 BT",
  "Leelawadee",
  "Letter Gothic",
  "Levenim MT",
  "Lucida Bright",
  "Lucida Sans",
  "Menlo",
  "MS Mincho",
  "MS Outlook",
  "MS Reference Specialty",
  "MS UI Gothic",
  "MT Extra",
  "MYRIAD PRO",
  "Marlett",
  "Meiryo UI",
  "Microsoft Uighur",
  "Minion Pro",
  "Monotype Corsiva",
  "PMingLiU",
  "Pristina",
  "SCRIPTINA",
  "Segoe UI Light",
  "Serifa",
  "SimHei",
  "Small Fonts",
  "Staccato222 BT",
  "TRAJAN PRO",
  "Univers CE 55 Medium",
  "Vrinda",
  "ZWAdobeF",
]

export function checkFonts(): {
  value: { fonts: string[]; count: number }
  codes: (string | number)[]
} {
  const holder = document.body
  const container = document.createElement("div")
  container.style.setProperty("visibility", "hidden", "important")
  container.style.position = "absolute"
  container.style.top = "0"
  container.style.left = "0"
  container.style.pointerEvents = "none"

  const defaultWidth: Record<string, number> = {}
  const defaultHeight: Record<string, number> = {}

  const createSpan = (fontFamily: string): HTMLSpanElement => {
    const span = document.createElement("span")
    span.style.position = "absolute"
    span.style.top = "0"
    span.style.left = "0"
    span.style.fontSize = textSize
    span.style.fontFamily = fontFamily
    span.textContent = testString
    container.appendChild(span)
    return span
  }

  const baseSpans = baseFonts.map(createSpan)

  const fontSpans: Record<string, HTMLSpanElement[]> = {}
  for (const font of fontList) {
    fontSpans[font] = baseFonts.map((base) =>
      createSpan(`'${font}',${base}`),
    )
  }

  holder.appendChild(container)

  for (let i = 0; i < baseFonts.length; i++) {
    defaultWidth[baseFonts[i]] = baseSpans[i].offsetWidth
    defaultHeight[baseFonts[i]] = baseSpans[i].offsetHeight
  }

  const detected = fontList.filter((font) =>
    baseFonts.some(
      (_, i) =>
        fontSpans[font][i].offsetWidth !== defaultWidth[baseFonts[i]] ||
        fontSpans[font][i].offsetHeight !== defaultHeight[baseFonts[i]],
    ),
  )

  holder.removeChild(container)

  const codes: (string | number)[] = []
  if (detected.length < 5) {
    codes.push(70.1)
  }
  if (detected.length === 0) {
    codes.push(70.2)
  }

  return {
    value: { fonts: detected, count: detected.length },
    codes,
  }
}

const prefText = "mmMwWLliI0fiflO&1"

const presets: Record<string, Record<string, string>[]> = {
  default: [],
  apple: [{ font: "-apple-system-body" }],
  serif: [{ fontFamily: "serif" }],
  sans: [{ fontFamily: "sans-serif" }],
  mono: [{ fontFamily: "monospace" }],
  min: [{ fontSize: "1px" }],
  system: [{ fontFamily: "system-ui" }],
}

export function checkFontPreferences(): {
  value: Record<string, number>
  codes: (string | number)[]
} {
  const holder = document.body
  const container = document.createElement("div")
  container.style.setProperty("visibility", "hidden", "important")
  container.style.position = "absolute"
  container.style.top = "0"
  container.style.left = "0"
  container.style.pointerEvents = "none"

  const elements: Record<string, HTMLSpanElement> = {}

  for (const key of Object.keys(presets)) {
    const span = document.createElement("span")
    span.textContent = prefText
    span.style.whiteSpace = "nowrap"
    const style = presets[key][0]
    if (style) {
      for (const name of Object.keys(style)) {
        ;(span.style as unknown as Record<string, string>)[name] = style[name]
      }
    }
    elements[key] = span
    container.appendChild(span)
  }

  holder.appendChild(container)

  const sizes: Record<string, number> = {}
  for (const key of Object.keys(presets)) {
    sizes[key] = elements[key].getBoundingClientRect().width
  }

  holder.removeChild(container)

  const codes: (string | number)[] = []
  const measurable = Object.values(sizes).filter((v) => v > 0).length
  if (measurable < 3) {
    codes.push(71.1)
  }

  return { value: sizes, codes }
}
