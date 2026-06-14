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
