export function checkDateIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): (string | number)[] {
  const codes: (string | number)[] = []

  if (location.pathname.indexOf("timezone") !== -1) {
    return codes
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

  return codes
}
