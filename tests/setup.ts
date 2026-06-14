import { vi } from "vitest"

vi.stubGlobal("CanvasRenderingContext2D", class {})

vi.stubGlobal("WebGLRenderingContext", class {})

vi.stubGlobal("BaseAudioContext", class {
  createAnalyser() { return {} }
})

vi.stubGlobal(
  "AudioContext",
  class {
    constructor() {
      this.destination = {}
    }
    createAnalyser() {
      return { frequencyBinCount: 32, getByteFrequencyData() {} }
    }
    createOscillator() {
      return {
        type: "",
        frequency: { value: 0 },
        connect() {},
        start() {},
      }
    }
    close() {}
    destination: AudioDestinationNode
  } as unknown as typeof AudioContext,
)

vi.stubGlobal("webkitAudioContext", class {})

const toBlobDesc = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype, "toBlob",
)
if (toBlobDesc?.value) {
  Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    ...toBlobDesc,
    writable: false,
  })
}

const toDataURLDesc = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype, "toDataURL",
)
if (toDataURLDesc?.value) {
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    ...toDataURLDesc,
    writable: false,
  })
}
