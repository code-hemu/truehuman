export function checkEssentialApis(): (string | number)[] {
  const checks: boolean[] = []

  checks.push(window.close === undefined)
  checks.push(window.Notification === undefined)
  checks.push(window.devicePixelRatio === undefined)
  checks.push(document.documentElement === undefined)
  checks.push(window.screenLeft === undefined || window.screenTop === undefined)
  checks.push(
    window.matchMedia === undefined ||
      typeof window.matchMedia !== "function",
  )
  checks.push(
    window.external !== undefined &&
      typeof window.external.toString !== "function",
  )
  checks.push(
    navigator.permissions !== undefined &&
      typeof navigator.permissions.query !== "function",
  )
  checks.push(
    document.documentElement !== undefined &&
      typeof document.documentElement.getAttributeNames !== "function",
  )

  const idx = checks.indexOf(true)
  if (idx !== -1) {
    return [Number("11." + (idx + 1))]
  }

  return []
}
