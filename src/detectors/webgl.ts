import { isGecko } from "../utils/browser.js"

type WebglInfo = {
  vendor: string
  renderer: string
}

function getWebglInfo(doc: Document): WebglInfo {
  try {
    const canvas = doc.createElement("canvas")

    const gl: WebGLRenderingContext | null =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null)

    if (!gl) {
      return { vendor: "", renderer: "" }
    }

    if (!isGecko) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info")

      if (ext) {
        return {
          vendor: String(
            gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || "",
          ),
          renderer: String(
            gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "",
          ),
        }
      }
    }

    return {
      vendor: String(gl.getParameter(gl.VENDOR) || ""),
      renderer: String(gl.getParameter(gl.RENDERER) || ""),
    }
  } catch {
    return { vendor: "", renderer: "" }
  }
}

export function checkWebglIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): {
  value: WebglInfo
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  const parentWebgl = getWebglInfo(document)

  if (
    location.pathname.includes("fingerprint") ||
    location.pathname.includes("defender")
  ) {
    return {
      value: parentWebgl,
      codes,
    }
  }

  if (iframe?.contentWindow) {
    try {
      const iframeWebgl = getWebglInfo(
        iframe.contentWindow.document,
      )

      comparisons.push(
        parentWebgl.vendor !== iframeWebgl.vendor ||
          parentWebgl.renderer !== iframeWebgl.renderer,
      )

      const vendor =
        iframeWebgl.vendor.toLowerCase()

      const renderer =
        iframeWebgl.renderer.toLowerCase()

      /** Common virtual-machine graphics adapters. */
      if (
        vendor.includes("vmware") ||
        renderer.includes("vmware") ||
        renderer.includes("svga")
      ) {
        codes.push(35.1)
      }
    } catch {
      /** Cross-origin iframe access blocked. */
    }
  }

  return {
    value: parentWebgl,
    codes,
  }
}