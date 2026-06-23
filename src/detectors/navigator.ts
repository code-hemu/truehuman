export function checkNavigatorIntegrity(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
): {
  value: {
    vendor: string
    platform: string
    languages: readonly string[]
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []

  if (iframe?.contentWindow) {
    comparisons.push(
      iframe.contentWindow.navigator.vendor !== navigator.vendor,
    )

    comparisons.push(
      iframe.contentWindow.navigator.webdriver !==
        navigator.webdriver,
    )
  }

  const props = [
    "vendor",
    "platform",
    "languages",
    "webdriver",
    "permissions",
    "getUserMedia",
  ]

  for (let i = 0; i < props.length; i++) {
    if (
      Object.getOwnPropertyDescriptor(
        navigator,
        props[i],
      ) !== undefined
    ) {
      codes.push("31.1." + (i + 1))
    }

    const desc = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      props[i],
    )

    if (desc) {
      if (desc.get && desc.get.toString()) {
        if (desc.writable) {
          codes.push("31.2." + (i + 1))
        }

        if (
          desc.get
            .toString()
            .indexOf("[native code]") === -1
        ) {
          codes.push("31.3." + (i + 1))
        }
      }

      if (
        desc.value &&
        desc.value.toString &&
        desc.value
          .toString()
          .indexOf("[native code]") === -1
      ) {
        codes.push("31.4." + (i + 1))
      }
    }
  }

  return {
    value: {
      vendor: navigator.vendor,
      platform: navigator.platform,
      languages: navigator.languages,
    },
    codes,
  }
}
