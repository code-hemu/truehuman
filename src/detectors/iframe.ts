export function checkIframeElementIntegrity(
  iframe: HTMLIFrameElement | null,
): {
  value: {
    property: string
    overridden: boolean
    exists: boolean
    native: boolean
  }[]
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  const props = ["src", "srcdoc"]

  const value = props.map((prop, i) => {
    const ownDesc =
      iframe !== null
        ? Object.getOwnPropertyDescriptor(iframe, prop)
        : undefined

    if (ownDesc !== undefined) {
      codes.push("34.1." + (i + 1))
    }

    const protoDesc = Object.getOwnPropertyDescriptor(
      HTMLIFrameElement.prototype,
      prop,
    )

    let native = false

    if (protoDesc) {
      if (protoDesc.get && protoDesc.get.toString()) {
        native = protoDesc
          .get
          .toString()
          .includes("[native code]")

        if (protoDesc.writable) {
          codes.push("34.2." + (i + 1))
        }

        if (!native) {
          codes.push("34.3." + (i + 1))
        }
      }

      if (
        protoDesc.value &&
        protoDesc.value.toString &&
        !protoDesc.value
          .toString()
          .includes("[native code]")
      ) {
        native = false
        codes.push("34.4." + (i + 1))
      }
    }

    return {
      property: prop,
      overridden: ownDesc !== undefined,
      exists: !!protoDesc,
      native,
    }
  })

  return {
    value,
    codes,
  }
}