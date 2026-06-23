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
