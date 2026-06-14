function getWebglVendor(doc: Document): string {
  try {
    const c = doc.createElement("canvas")
    if (!c) return ""
    const gl: WebGLRenderingContext | null =
      (c.getContext("webgl") as WebGLRenderingContext | null) ||
      (c.getContext("experimental-webgl") as WebGLRenderingContext | null)
    if (!gl) return ""
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (!ext) return ""
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
    if (vendor) return String(vendor)
    return ""
  } catch {
    return ""
  }
}

export function checkWebglIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
  codes: (string | number)[],
): void {
  if (
    location.pathname.indexOf("fingerprint") !== -1 ||
    location.pathname.indexOf("defender") !== -1
  ) {
    return
  }

  if (iframe?.contentWindow) {
    const parentVendor = getWebglVendor(document)
    const iframeVendor = getWebglVendor(iframe.contentWindow.document)
    comparisons.push(parentVendor !== iframeVendor)

    if (
      iframeVendor &&
      iframeVendor.toLowerCase().indexOf("vmware") !== -1
    ) {
      codes.push(35.1)
    }
  }
}
