export function fingerprintAudio(): string {
  try {
    const ctx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)() as AudioContext
    const analyser = ctx.createAnalyser()
    const oscillator = ctx.createOscillator()
    oscillator.type = "triangle"
    oscillator.frequency.value = 10000
    oscillator.connect(analyser)
    analyser.connect(ctx.destination)
    oscillator.start(0)

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)

    const hash = Array.from(data.slice(0, 32))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    ctx.close()
    return hash
  } catch {
    return ""
  }
}
