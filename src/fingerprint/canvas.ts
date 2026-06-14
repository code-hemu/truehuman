export function fingerprintCanvas(): string {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    ctx.textBaseline = "alphabetic"
    ctx.fillStyle = "#f60"
    ctx.fillRect(100, 50, 50, 50)

    ctx.fillStyle = "#069"
    ctx.font = "16px Arial"
    ctx.fillText("C-L" + String.fromCharCode(8470), 4, 20)

    ctx.fillStyle = "#ccc"
    ctx.font = "12px sans-serif"
    ctx.fillText("truehuman", 160, 240)

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(150, 100, 30, 0, Math.PI * 2, true)
    ctx.stroke()

    return canvas.toDataURL()
  } catch {
    return ""
  }
}
