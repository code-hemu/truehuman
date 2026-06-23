export function checkUserAgent(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): {
  value: Record<string, unknown>
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  if (/; wv/i.test(navigator.userAgent)) {
    codes.push(10.1)
  }

  if (/headless/i.test(navigator.userAgent)) {
    codes.push(10.2)
  }

  let iframeMismatch: boolean | null = null

  if (
    location.pathname.indexOf("useragent") === -1 &&
    location.pathname.indexOf("mobile-view") === -1
  ) {
    if (iframe?.contentWindow) {
      iframeMismatch =
        iframe.contentWindow.navigator.userAgent !==
        navigator.userAgent

      comparisons.push(iframeMismatch)
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

  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        brands: { brand: string; version: string }[]
        mobile: boolean
        platform: string
      }
    }
  ).userAgentData

  return {
    value: {
      brands: uaData?.brands?.[0] ?? [],
      mobile: uaData?.mobile ?? null,
      platform: uaData?.platform ?? navigator.platform,
      iframeMismatch,
    },
    codes,
  }
}
