export function isPropertyNative(
  proto: object,
  prop: string,
): boolean | null {
  try {
    const desc = Object.getOwnPropertyDescriptor(proto, prop)
    if (!desc) return null
    if (desc.get) return desc.get.toString().includes("[native code]")
    if (desc.value) return desc.value.toString().includes("[native code]")
    return null
  } catch {
    return null
  }
}

export function isPropertyOverridden(proto: object, prop: string): boolean {
  try {
    const desc = Object.getOwnPropertyDescriptor(proto, prop)
    if (!desc) return false
    if (desc.get) return desc.writable ?? false
    if (desc.value) return desc.writable ?? false
    return false
  } catch {
    return false
  }
}
