export function checkScreenIntegrity(): (string | number)[] {
  const codes: (string | number)[] = []

  const props = ["width", "height", "orientation"]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(screen, props[i]) !== undefined
    ) {
      codes.push("32.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(Screen.prototype, props[i])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("32.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("32.3." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("32.4." + (i + 1))
      }
    }
  }

  return codes
}
