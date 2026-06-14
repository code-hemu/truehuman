function renderCanvasFingerprint(): { blocked: boolean; zeroSum: boolean; hash: string } | null {
  try {
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 256
    const ctx = c.getContext("2d")
    if (!ctx) return { blocked: true, zeroSum: false, hash: "" }

    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillStyle = "#f60"
    ctx.fillRect(10, 10, 100, 50)
    ctx.fillStyle = "#069"
    ctx.fillText("Cwm fjordbank glyphs vext quiz, ", 2, 15)

    const imageData = ctx.getImageData(0, 0, 256, 256)
    const data = imageData.data

    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i] + data[i + 1] + data[i + 2]
    }
    if (sum === 0) return { blocked: false, zeroSum: true, hash: "" }

    let hash = 0x811c9dc5
    for (let i = 0; i < Math.min(data.length, 4096); i += 4) {
      hash ^= data[i]
      hash = Math.imul(hash, 0x01000193)
      hash ^= data[i + 1]
      hash = Math.imul(hash, 0x01000193)
    }

    return { blocked: false, zeroSum: false, hash: (hash >>> 0).toString(16) }
  } catch {
    return { blocked: true, zeroSum: false, hash: "" }
  }
}

export function checkCanvasFingerprint(): (string | number)[] {
  const codes: (string | number)[] = []
  const result = renderCanvasFingerprint()
  if (!result) return codes

  if (result.blocked) {
    codes.push(47.1)
  } else if (result.zeroSum) {
    codes.push(47.2)
  }

  return codes
}

export function checkCanvasPrototypes(
  codes: (string | number)[],
): void {
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
    [CanvasRenderingContext2D.prototype, "fillText"],
    [CanvasRenderingContext2D.prototype, "strokeText"],
    [CanvasRenderingContext2D.prototype, "drawImage"],
    [Path2D.prototype, "addPath"],
    [CanvasRenderingContext2D.prototype, "fillRect"],
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
}
