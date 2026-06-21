export function checkPrototypes(): {
  value: (string | number)[]
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []
  const value: (string | number)[] = []

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
    const desc = Object.getOwnPropertyDescriptor(
      methods[i][0],
      methods[i][1],
    )
    if (desc) {
      value.push(methods[i][1]);
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
        desc.value.toString &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("35.5." + (i + 1))
      }
    }
  }

  return {value, codes}
}