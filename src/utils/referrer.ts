export type ReferrerType = "file" | "localhost" | "direct" | "internal" | "external"

export function checkEnvironment(): boolean {
  try {
    const emptyReferrer = document.referrer === ""
    const emptySearch = document.location.search === ""
    const hasHtmlPath = document.location.pathname.indexOf(".html") !== -1
    return emptyReferrer && emptySearch && hasHtmlPath
  } catch {
    return false
  }
}

export function getReferrer(): ReferrerType {
  if (location.protocol === "file:") return "file"
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return "localhost"
  if (document.referrer === "") return "direct"
  try {
    const refUrl = new URL(document.referrer)
    return refUrl.origin === location.origin ? "internal" : "external"
  } catch {
    return "external"
  }
}
