import { isGecko } from "../utils/browser.js"

const g = globalThis as Record<string, unknown>
const hasChrome =
  typeof g.chrome !== "undefined" &&
  g.chrome !== null

export function checkAutomation(
  iframe: HTMLIFrameElement | null,
): {
  value: {
    automation: boolean
    inIframe: boolean
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  const automation = navigator.webdriver
  const inIframe = window !== window.top
  const maxTouchPoints = navigator.maxTouchPoints

  /** Automation indicators exposed by the browser runtime. */
  if (inIframe) {
    codes.push(40)
  }

  if (automation) {
    codes.push(41)
  }

  /** Chromium-specific integrity checks. */
  if (
    hasChrome &&
    (g.chrome as Record<string, unknown>).app !== undefined &&
    maxTouchPoints === 0
  ) {
    const runtime =
      (g.chrome as Record<string, unknown>)
        .runtime as
        | Record<string, unknown>
        | undefined

    if (runtime?.connect) {
      try {
        postMessage(runtime.connect as string, "*")
      } catch (e: unknown) {
        const msg = (e as Error).message

        if (!msg.includes("[native code]")) {
          codes.push(42.1)
        }
      }
    }

    /** Cross-frame native Function validation. */
    try {
      const iw =
        iframe?.contentWindow as Record<
          string,
          unknown
        > | null

      if (iw) {
        const fnProto = (
          iw.Function as typeof Function
        ).prototype

        const fnStatic =
          iw.Function as unknown as Record<
            string,
            unknown
          >

        const result = fnProto.toString.apply(
          fnStatic.toString as never,
        )

        if (!(result as string).includes("toString")) {
          codes.push(42.2)
        }
      }
    } catch {}

    /** Detect patched Function.prototype.toString implementations. */
    try {
      Object.getOwnPropertyDescriptor(
        Function.prototype,
        "toString",
      )?.value?.()
    } catch (e: unknown) {
      const err = e as Error

      const noStack =
        !err.stack ||
        !err.stack.includes("at Object.toString")

      const noMessage =
        !err.message ||
        !err.message.includes(
          "Function.prototype.toString",
        )

      if (noStack || noMessage) {
        codes.push(42.3)
      }
    }

    /** Known Chromium automation window-size artifact. */
    const delta =
      window.outerHeight - window.innerHeight

    if (delta >= 180) {
      codes.push(42.4)
    }
  }

  /** Browser-state consistency heuristics. */
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
    maxTouchPoints === 0 &&
    document.visibilityState === "visible" &&
    window.matchMedia("(device-width:100vw)")
      .matches &&
    window.matchMedia("(device-height:100vh)")
      .matches &&
    !window.matchMedia(
      "(display-mode:fullscreen)",
    ).matches
  ) {
    if (
      !isGecko &&
      screen.width === screen.availWidth &&
      screen.height === screen.availHeight
    ) {
      codes.push(44.4)
    }
  }

  /** Development and debugging flag detection. */
  if (location.href.includes("nods=true")) {
    codes.push(46)
  }

  return {
    value: {
      automation,
      inIframe,
    },
    codes,
  }
}