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
