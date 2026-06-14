export function checkUserAgent(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): (string | number)[] {
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

  return codes
}
