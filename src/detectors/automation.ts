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
