export function fingerprintWebGL(): string {
  try {
    const canvas = document.createElement("canvas")
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null)
    if (!gl) return ""

    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    const parts: string[] = []

    parts.push(gl.getParameter(gl.RENDERER) ?? "")
    parts.push(gl.getParameter(gl.VENDOR) ?? "")
    parts.push(String(gl.getParameter(gl.VERSION)))
    parts.push(String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)))

    if (ext) {
      parts.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "")
      parts.push(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) ?? "")
    }

    const supportedExts = gl.getSupportedExtensions() ?? []
    parts.push(supportedExts.sort().join(","))

    const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    parts.push(String(maxTexSize))

    return parts.join("|")
  } catch {
    return ""
  }
}
