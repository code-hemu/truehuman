/**
 * Generates a canvas using geometry and text rendering.
 */
export function checkCanvasFingerprint(): {
  codes: (string | number)[]
  value: {
    winding: boolean
    geometry: string
    text: string
  }
} | null {
  const codes: (string | number)[] = []

  let winding = false
  let geometry = ""
  let text = ""

  try {
    /**
     * Create an isolated canvas surface used exclusively
     * for fingerprint collection.
     */
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 256

    const ctx = c.getContext("2d")

    /**
     * Canvas 2D context unavailable.
     */
    if (!ctx) {
      codes.push(47.1)

      return {
        codes,
        value: {
          winding: false,
          geometry: "",
          text: "",
        },
      }
    }

    /**
     * Geometry rendering pass.
     */
    ctx.fillStyle = "#f60"
    ctx.fillRect(10, 10, 100, 50)

    ctx.beginPath()
    ctx.rect(50, 50, 100, 100)
    ctx.fillStyle = "rgb(0, 153, 59)"
    ctx.fill()

    /**
     * Validate winding-rule behavior.
     */
    ctx.beginPath()
    ctx.rect(50, 50, 100, 100)

    const inFill =
      typeof (ctx as any).isPointInFill === "function" &&
      (ctx as any).isPointInFill(100, 100)

    const inPath =
      typeof ctx.isPointInPath === "function" &&
      ctx.isPointInPath(100, 100)

    winding = inFill || inPath

    if (!winding) {
      codes.push("47.2")
    }

    /**
     * Detect canvas blocking or aggressive noise injection
     * by checking whether all rendered pixels are empty.
     */
    const imageData = ctx.getImageData(0, 0, 256, 256)

    let sum = 0

    for (let i = 0; i < imageData.data.length; i += 4) {
      sum +=
        imageData.data[i] +
        imageData.data[i + 1] +
        imageData.data[i + 2]
    }

    if (sum === 0) {
      codes.push("47.3")
    }

    /**
     * Capture geometry fingerprint.
     */
    geometry = c.toDataURL()

    /**
     * Text rendering pass.
     */
    ctx.clearRect(0, 0, 256, 256)

    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillStyle = "#000"

    ctx.fillText(
      "trueHuman.js: Detect bots, verify humans.",
      2,
      15,
    )

    /**
     * Capture text fingerprint.
     */
    text = c.toDataURL()
  } catch {
    codes.push(47.1)
  }

  return {
    codes,
    value: {
      winding,
      geometry,
      text,
    },
  }
}