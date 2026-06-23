export function checkPrototypes(): {
  value: {
    method: string
    exists: boolean
    native: boolean
  }[]
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

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

  const value = methods.map(([obj, method], i) => {
    const desc = Object.getOwnPropertyDescriptor(obj, method)

    let native = false

    if (desc) {
      if (desc.get) {
        native = desc.get
          .toString()
          .includes("[native code]")

        if (desc.writable) {
          codes.push("35.3." + (i + 1))
        }

        if (!native) {
          codes.push("35.4." + (i + 1))
        }
      } else if (desc.value?.toString) {
        native = desc.value
          .toString()
          .includes("[native code]")

        if (!native) {
          codes.push("35.5." + (i + 1))
        }
      }
    }

    return {
      method,
      exists: !!desc,
      native,
    }
  })

  return {
    value,
    codes,
  }
}