export function checkDocumentIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): (string | number)[] {
  const codes: (string | number)[] = []

  if (iframe?.contentWindow) {
    comparisons.push(
      iframe.contentWindow.document.hidden !== document.hidden,
    )
  }

  const props = ["hidden", "hasFocus"]
  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(document, props[i]) !== undefined
    ) {
      codes.push("30.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(Document.prototype, props[i])
    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("30.2." + (i + 1))
        }
        if (desc.get.toString().indexOf("[native code]") === -1) {
          codes.push("30.3." + (i + 1))
        }
      }
      if (desc.value && desc.value.toString() && desc.value.toString().indexOf("[native code]") === -1) {
        codes.push("30.4." + (i + 1))
      }
    }
  }

  return codes
}
