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

export function checkPrototypeIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
  codes: (string | number)[],
): (string | number)[] {
  if (
    location.pathname.indexOf("fingerprint") !== -1 ||
    location.pathname.indexOf("defender") !== -1
  ) {
    return codes
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

  const methods: [object, string][] = [
    [HTMLElement.prototype, "offsetWidth"],
    [HTMLElement.prototype, "offsetHeight"],
    [HTMLCanvasElement.prototype, "toBlob"],
    [AudioBuffer.prototype, "getChannelData"],
    [HTMLCanvasElement.prototype, "toDataURL"],
    [BaseAudioContext.prototype, "createAnalyser"],
    [WebGLRenderingContext.prototype, "getExtension"],
    [WebGLRenderingContext.prototype, "getParameter"],
    [CanvasRenderingContext2D.prototype, "getImageData"],
    [WebGLRenderingContext.prototype, "getSupportedExtensions"],
  ]

  for (let i = 0; i < methods.length; i++) {
    const desc = Object.getOwnPropertyDescriptor(methods[i][0], methods[i][1])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("35.3." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("35.4." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("35.5." + (i + 1))
      }
    }
  }

  return codes
}
