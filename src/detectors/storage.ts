function readStorage(): { sessionStorage: boolean; localStorage: boolean; indexedDB: boolean | undefined } {
  let sessionStorage: boolean
  try {
    sessionStorage = !!window.sessionStorage
  } catch {
    sessionStorage = true
  }

  let localStorage: boolean
  try {
    localStorage = !!window.localStorage
  } catch {
    localStorage = true
  }

  let indexedDB: boolean | undefined
  try {
    indexedDB = !!window.indexedDB
  } catch {
    indexedDB = true
  }

  return { sessionStorage, localStorage, indexedDB }
}

export function checkStorage(): {
  value: {
    pageVisits: number
    sessionStorage: boolean
    localStorage: boolean
    indexedDB: boolean | undefined
  }
  codes: (string | number)[]
} {
  const codes: (string | number)[] = []
  const storage = readStorage()

  if (!storage.sessionStorage) {
    codes.push(61.1)
  }
  if (!storage.indexedDB) {
    codes.push(62.1)
  }

  let count = 0
  try {
    const key = location.pathname + "&cnt="
    const raw = localStorage.getItem(key) || "0|0"
    const parts = raw.split("|")
    count = Number(parts[0]) || 0
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

  return {
    value: {
      pageVisits: count,
      ...storage,
    },
    codes,
  }
}
