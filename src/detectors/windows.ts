const NAV_API_CHECKS: (() => boolean)[] = [
  () => window.close === undefined,
  () => window.Notification === undefined,
  () => window.devicePixelRatio === undefined,
  () => document.documentElement === undefined,
  () => window.screenLeft === undefined || window.screenTop === undefined,
  () =>
    window.matchMedia === undefined ||
    typeof window.matchMedia !== "function",
  () =>
    window.external !== undefined &&
    typeof window.external.toString !== "function",
  () =>
    navigator.permissions !== undefined &&
    typeof navigator.permissions.query !== "function",
  () =>
    document.documentElement !== undefined &&
    typeof document.documentElement.getAttributeNames !==
      "function",
]

export function checkEssentialApis(): {
  value: {
    close: boolean
    notification: boolean
    devicePixelRatio: number
    matchMedia: boolean
    permissions: boolean
    getAttributeNames: boolean
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  /** Execute all integrity checks. */
  for (let i = 0; i < NAV_API_CHECKS.length; i++) {
    if (NAV_API_CHECKS[i]()) {
      codes.push(Number("11." + (i + 1)))
    }
  }

  return {
    value: {
      close:
        typeof window.close === "function",

      notification:
        typeof window.Notification !== "undefined",

      devicePixelRatio:
        window.devicePixelRatio,

      matchMedia:
        typeof window.matchMedia === "function",

      permissions:
        typeof navigator.permissions?.query ===
        "function",

      getAttributeNames:
        typeof document.documentElement
          ?.getAttributeNames === "function",
    },
    codes,
  }
}