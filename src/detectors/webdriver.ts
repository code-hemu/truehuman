const g = globalThis as Record<string, unknown>
const hasChrome = typeof g.chrome !== "undefined" && g.chrome !== null

export function checkAutomation(
  iframe: HTMLIFrameElement | null,
): (string | number)[] {
  const codes: (string | number)[] = []

  if (window !== window.top) {
    codes.push(40)
  }

  if (navigator.webdriver) {
    codes.push(41)
  }

  if (
    hasChrome &&
    (g.chrome as Record<string, unknown>).app !== undefined &&
    navigator.maxTouchPoints === 0
  ) {
    const runtime = (g.chrome as Record<string, unknown>)
      .runtime as Record<string, unknown> | undefined
    if (runtime?.connect) {
      try {
        postMessage(runtime.connect as string, "*")
      } catch (e: unknown) {
        const msg = (e as Error).message
        if (msg.indexOf("[native code]") === -1) {
          codes.push(42.1)
        }
      }
    }

    try {
      const iw = iframe?.contentWindow as Record<string, unknown> | null
      if (iw) {
        const fnProto = (iw.Function as typeof Function).prototype
        const fnStatic = iw.Function as unknown as Record<string, unknown>
        const result = fnProto.toString.apply(fnStatic.toString as never)
        if ((result as string).indexOf("toString") === -1) {
          codes.push(42.2)
        }
      }
    } catch {
      // errorCode 42 would go to errors array
    }

    try {
      Object.getOwnPropertyDescriptor(Function.prototype, "toString")?.value?.()
    } catch (e: unknown) {
      const err = e as Error
      const noStack = !err.stack || err.stack.indexOf("at Object.toString") === -1
      const noMessage =
        !err.message ||
        err.message.indexOf("Function.prototype.toString") === -1
      if (noStack || noMessage) {
        codes.push(42.3)
      }
    }

    const delta = window.outerHeight - window.innerHeight
    if (delta === 132 || delta === 133) {
      codes.push(42.4)
    }
  }

  return codes
}

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
