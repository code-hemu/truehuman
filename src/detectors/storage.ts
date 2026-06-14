export function checkStorage(): (string | number)[] {
  const codes: (string | number)[] = []

  try {
    const key = location.pathname + "&cnt="
    const raw = localStorage.getItem(key) || "0|0"
    const parts = raw.split("|")
    let count = Number(parts[0]) || 0
    const timestamp = Number(parts[1]) || Date.now()

    if (Date.now() - timestamp > 72e5) {
      count = 0
    }

    localStorage.setItem(key, count + 1 + "|" + Date.now())

    if (count > 5) {
      codes.push(60.1)
    }

    if (localStorage.length === 0) {
      codes.push(60.2)
    }
  } catch {
    codes.push(60.3)
  }

  return codes
}
