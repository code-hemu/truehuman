export function checkIframeElementIntegrity(iframe: HTMLIFrameElement | null): {
  value: (string | number)[]
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []
  const value: (string | number)[] = []

  const props = ["src", "srcdoc"]
  for (let i = 0; i < props.length; i++) {
    if (iframe && Object.getOwnPropertyDescriptor(iframe, props[i]) !== undefined) {
      codes.push("34.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(
      HTMLIFrameElement.prototype,
      props[i],
    )
    if (desc) {
      value.push(props[i]);
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("34.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("34.3." + (i + 1))
        }
      }
      if (
        desc.value &&
        desc.value.toString() &&
        desc.value.toString().indexOf("[native code]") === -1
      ) {
        codes.push("34.4." + (i + 1))
      }
    }
  }

  return { 
    codes,
    value
  }
}
