function matchMediaQuery(prefix: string, value: string): boolean {
  return matchMedia(`(${prefix}: ${value})`).matches
}

export function checkForcedColors(): {
  value: boolean | undefined
  codes: (string | number)[]
} {
  if (matchMediaQuery("forced-colors", "active")) {
    return { value: true, codes: [81.1] }
  }
  if (matchMediaQuery("forced-colors", "none")) {
    return { value: false, codes: [] }
  }
  return { value: undefined, codes: [] }
}

export function checkInvertedColors(): {
  value: boolean | undefined
  codes: (string | number)[]
} {
  if (matchMediaQuery("inverted-colors", "inverted")) {
    return { value: true, codes: [82.1] }
  }
  if (matchMediaQuery("inverted-colors", "none")) {
    return { value: false, codes: [] }
  }
  return { value: undefined, codes: [] }
}
