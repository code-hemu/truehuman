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
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 256
    const ctx = c.getContext("2d")
    if (!ctx) {
      codes.push(47.1)
      return {
        codes,
        value: { winding: false, geometry: "", text: ""},
      }
    }
    
    ctx.fillStyle = "#f60"
    ctx.fillRect(10, 10, 100, 50)

    ctx.beginPath()
    ctx.rect(50, 50, 100, 100)
    ctx.fillStyle = "#069"
    ctx.fill()

    ctx.beginPath()
    ctx.rect(50, 50, 100, 100)
    const inFill = typeof (ctx as any).isPointInFill === "function" && (ctx as any).isPointInFill(100, 100)
    const inPath = typeof ctx.isPointInPath === "function" && ctx.isPointInPath(100, 100)
    winding = inFill || inPath
    if (!winding) codes.push("47.2")

    // Check for all-zero pixels (noise injection / canvas blocking)
    const before = ctx.getImageData(0, 0, 256, 256)
    let sum = 0
    for (let i = 0; i < before.data.length; i += 4) {
      sum += before.data[i] + before.data[i + 1] + before.data[i + 2]
    }
    if (sum === 0) codes.push("47.3")

    geometry = c.toDataURL()

    // Text pass
    ctx.clearRect(0, 0, 256, 256)
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillStyle = "#000"
    ctx.fillText("Cwm fjordbank glyphs vext quiz", 2, 15)
    text = c.toDataURL()

  } catch {
    codes.push(47.1)
  }
  
  return {
    codes,
    value: { winding, geometry, text},
  }
}
