const g = globalThis as Record<string, unknown>
const hasChrome = typeof g.chrome !== "undefined"

export function checkBrowserFlags(): (string | number)[] {
  const codes: (string | number)[] = []

  if (!hasChrome) {
    if (navigator.webdriver === undefined) {
      codes.push(44.2)
    }
    if ("contacts" in navigator) {
      codes.push(44.3)
    }
  } else if (
    window.screenTop === 0 &&
    document.hasFocus() &&
    navigator.maxTouchPoints === 0 &&
    document.visibilityState === "visible" &&
    window.matchMedia("(device-width:100vw)").matches &&
    window.matchMedia("(device-height:100vh)").matches &&
    window.matchMedia("(display-mode:fullscreen)").matches === false
  ) {
    const wEqualsAvailW = screen.width === screen.availWidth
    const hEqualsAvailH = screen.height === screen.availHeight
    if (wEqualsAvailW && hEqualsAvailH) {
      codes.push(44.4)
    }
  }

  if (location.href.indexOf("nods=true") !== -1) {
    codes.push(46)
  }

  return codes
}
