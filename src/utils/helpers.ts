export function createSandboxedIframe(): HTMLIFrameElement | null {
  try {
    const iframe = document.createElement("iframe")
    iframe.src = "javascript:"
    iframe.style.display = "none"
    iframe.setAttribute("sandbox", "allow-same-origin")
    document.documentElement.appendChild(iframe)
    return iframe
  } catch {
    return null
  }
}

export function cleanupIframe(iframe: HTMLIFrameElement | null): void {
  try {
    iframe?.remove()
  } catch {
    // ignore
  }
}

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
