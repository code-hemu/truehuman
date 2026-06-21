export function checkEnvironment(): boolean {
  try {
    const emptyReferrer = document.referrer === ""
    const emptySearch = document.location.search === ""
    const hasHtmlPath = document.location.pathname.indexOf(".html") !== -1
    return emptyReferrer && emptySearch && hasHtmlPath
  } catch {
    return false
  }
}



const NAV_API_CHECKS: (() => boolean)[] = [
  () => window.close === undefined,
  () => window.Notification === undefined,
  () => window.devicePixelRatio === undefined,
  () => document.documentElement === undefined,
  () => window.screenLeft === undefined || window.screenTop === undefined,
  () => window.matchMedia === undefined || typeof window.matchMedia !== "function",
  () => window.external !== undefined && typeof window.external.toString !== "function",
  () => navigator.permissions !== undefined && typeof navigator.permissions.query !== "function",
  () => document.documentElement !== undefined && typeof document.documentElement.getAttributeNames !== "function",
]

export function checkEssentialApis(): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []
  for (let i = 0; i < NAV_API_CHECKS.length; i++) {
    if (NAV_API_CHECKS[i]()) {
      codes.push(Number("11." + (i + 1)))
      return { value: codes.length, codes }
    }
  }
  return { value: 0, codes }
}

export function checkUserAgent(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): {
  value: Record<string, unknown> | null
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  if (/; wv/i.test(navigator.userAgent)) {
    codes.push(10.1)
  }

  if (/headless/i.test(navigator.userAgent)) {
    codes.push(10.2)
  }

  if (
    location.pathname.indexOf("useragent") === -1 &&
    location.pathname.indexOf("mobile-view") === -1
  ) {
    if (iframe?.contentWindow) {
      comparisons.push(
        iframe.contentWindow.navigator.userAgent !== navigator.userAgent,
      )
    }

    if (
      CSS.supports("(-moz-user-select:unset)") &&
      /Chrome/.test(navigator.userAgent)
    ) {
      codes.push(10.3)
    }

    if (
      CSS.supports("(-webkit-box-reflect:unset)") &&
      /Firefox/.test(navigator.userAgent)
    ) {
      codes.push(10.4)
    }
  }

  return { value: null, codes }
}

export function checkNavigation(): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []
  const g = globalThis as Record<string, unknown>
  const hasChrome = typeof g.chrome !== "undefined"

  if (!hasChrome || localStorage.length !== 0 || !performance) {
    return { value: 0, codes }
  }

  const entries = performance.getEntriesByType("navigation")
  if (!entries || !entries.length) return { value: 0, codes }

  const entry = entries[0] as PerformanceNavigationTiming
  if (
    entry &&
    entry.type === "navigate" &&
    entry.duration === 0 &&
    entry.transferSize === 0 &&
    entry.domComplete === 0
  ) {
    if (entry.fetchStart === 0 || entry.secureConnectionStart === 0) {
      codes.push(20.1)
    }

    if (
      entry.connectEnd === entry.connectStart &&
      entry.responseEnd === entry.responseStart &&
      entry.loadEventEnd === entry.loadEventStart &&
      entry.domainLookupEnd === entry.domainLookupStart &&
      entry.domContentLoadedEventEnd === entry.domContentLoadedEventStart
    ) {
      codes.push(20.2)
    }
  }

  return { value: codes.length, codes }
}

export function checkDocumentIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []

  if (iframe?.contentWindow) {
    comparisons.push(
      iframe.contentWindow.document.hidden !== document.hidden,
    )
  }

  const props = ["hidden", "hasFocus"]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(document, props[i]) !== undefined
    ) {
      codes.push("30.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(Document.prototype, props[i])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("30.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("30.3." + (i + 1))
        }
      }
      if (desc.value && desc.value.toString() && desc.value.toString().indexOf("[native code]") === -1) {
        codes.push("30.4." + (i + 1))
      }
    }
  }

  return { value: codes.length, codes }
}

export function checkNavigatorIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []

  if (iframe?.contentWindow) {
    comparisons.push(
      iframe.contentWindow.navigator.vendor !== navigator.vendor,
    )
    comparisons.push(
      iframe.contentWindow.navigator.webdriver !== navigator.webdriver,
    )
  }

  const props = [
    "vendor",
    "platform",
    "languages",
    "webdriver",
    "permissions",
    "getUserMedia",
  ]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(navigator, props[i]) !== undefined
    ) {
      codes.push("31.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      props[i],
    )
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("31.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("31.3." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("31.4." + (i + 1))
      }
    }
  }

  return { value: codes.length, codes }
}

export function checkDateIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []

  if (location.pathname.indexOf("timezone") !== -1) {
    return { value: 0, codes }
  }

  if (iframe?.contentWindow) {
    const d1 = new Date()
    const iw = iframe.contentWindow as unknown as { Date: typeof Date }
    const d2 = new iw.Date()
    comparisons.push(d1.getTimezoneOffset() !== d2.getTimezoneOffset())
  }

  const d = new Date()
  const props = ["toString", "getTimezoneOffset"]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(d, props[i]) !== undefined
    ) {
      codes.push("33.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(Date.prototype, props[i])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("33.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("33.3." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("33.4." + (i + 1))
      }
    }
  }

  return { value: codes.length, codes }
}

export function checkStorage(): { value: number; codes: (string | number)[] } {
  const codes: (string | number)[] = []

  try {
    const key = location.pathname + "&cnt="
    const raw = localStorage.getItem(key) || "0|0"
    const parts = raw.split("|")
    let count = Number(parts[0]) || 0
    const timestamp = Number(parts[1]) || Date.now()

    if (Date.now() - timestamp > 72e5) {
      count = 0
    }

    localStorage.setItem(key, count + 1 + "|" + Date.now())

    if (count > 5) {
      codes.push(60.1)
    }

    if (localStorage.length === 0) {
      codes.push(60.2)
    }
  } catch {
    codes.push(60.3)
  }

  return { value: codes.length, codes }
}
