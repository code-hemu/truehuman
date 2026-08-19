import { analyze } from "../src"
import type { AnalyzeResult } from "../src"

const resultDiv = document.getElementById("result")!
if (!resultDiv) {
  throw new Error("The result element isn't found in the HTML code")
}

function renderBadge(visitor: AnalyzeResult["visitor"]): string {
  const cls =
    visitor === "human" ? "badge-human"
    : visitor === "suspicious" ? "badge-suspicious"
    : "badge-bot"
  return `<span class="badge ${cls}">${visitor.toUpperCase()}</span>`
}

function esc(s: unknown): string {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function fmtVal(v: unknown): string {
  if (v === undefined || v === null) return "—"
  if (typeof v === "boolean") return String(v)
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return v
  if (Array.isArray(v)) return `[${v.length} items]`
  return JSON.stringify(v)
}

function renderComponentRow(name: string, entry: { duration: number; value: unknown }): string {
  const display = fmtVal(entry.value)
  const full =
    typeof entry.value === "object" && entry.value !== null && !Array.isArray(entry.value)
      ? Object.entries(entry.value as Record<string, unknown>).map(([k, val]) => `${k}: ${fmtVal(val)}`).join(" | ")
      : typeof entry.value === "object"
        ? JSON.stringify(entry.value)
        : String(entry.value)
  return `<tr>
    <td><strong>${esc(name)}</strong></td>
    <td class="duration-cell">${entry.duration.toFixed(2)}ms</td>
    <td class="val-cell" title="${esc(full)}">${esc(display)}</td>
  </tr>`
}

function renderDebug(result: AnalyzeResult): string {
  if (!result.debug) return ""
  return `<details>
    <summary>Debug Info</summary>
    <div class="evidence">integrityCodes: [${result.debug.integrityCodes.join(", ")}]</div>
    <div class="evidence">iframeComparisons: ${result.debug.iframeComparisons}</div>
    <div class="evidence">environmentFlag: ${result.debug.environmentFlag}</div>
    <div class="evidence">errors: [${result.debug.errors.join(", ")}]</div>
  </details>`
}

function resultPublicText(result: AnalyzeResult): string {
  return `Visitor identifier: \`${result.visitorId}\`
Referrer: ${result.referrer}
Verdict: ${result.visitor}
Risk: ${JSON.stringify(result.risk)}
Confidence: ${result.confidence}%
User agent: \`${navigator.userAgent}\`
Components:
\`\`\`
${JSON.stringify(result.components, null, 2)}
\`\`\``
}

function errorDebugText(errorMessage: string, totalTime: number): string {
  return `Unexpected error:
\`\`\`
${errorMessage}
\`\`\`
Time passed before the error: ${totalTime}ms
User agent: \`${navigator.userAgent}\``
}

function render(result: AnalyzeResult): void {
  const comps = Object.entries(result.components)
    .map(([name, entry]) => renderComponentRow(name, entry))
    .join("")
  resultDiv.innerHTML = `<div class="verdict-row">
    ${renderBadge(result.visitor)}
    <span class="stat">Score: <strong>${result.risk.score}</strong></span>
    <span class="stat">Level: <strong>${result.risk.level}</strong></span>
    <span class="stat">Confidence: <strong>${result.confidence}%</strong></span>
    <span class="stat">Referrer: <strong>${result.referrer}</strong></span>
  </div>
  <div class="section">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Component</th><th>Duration</th><th>Value</th></tr>
        </thead>
        <tbody>${comps}</tbody>
      </table>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Debug</div>
    ${renderDebug(result)}
  </div>`
}

function addSection(header: string, content: string): void {
  const headerElement = document.createElement("div")
  headerElement.textContent = header
  headerElement.classList.add("heading")
  resultDiv.appendChild(headerElement)

  const contentElement = document.createElement("pre")
  contentElement.textContent = content
  resultDiv.appendChild(contentElement)
}

function initializeDebugButtons(text: string): void {
  const copyButton = document.querySelector("#debugCopy")
  if (copyButton instanceof HTMLButtonElement) {
    copyButton.disabled = false
    copyButton.addEventListener("click", (event) => {
      event.preventDefault()
      copy(text).catch(() => {
        // Do nothing in case of a copying error
      })
    })
  }

  const shareButton = document.querySelector("#debugShare")
  if (shareButton instanceof HTMLButtonElement) {
    shareButton.disabled = false
    shareButton.addEventListener("click", (event) => {
      event.preventDefault()
      share(text)
    })
  }
}

const execCopyCommand = (document as unknown as { execCommand: (commandId: string) => boolean }).execCommand

function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  return new Promise((resolve) => {
    const textarea = document.createElement("textarea")
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    try {
      execCopyCommand("copy")
    } catch {
      // Do nothing in case of a copying error
    }
    document.body.removeChild(textarea)
    resolve()
  })
}

async function share(text: string): Promise<void> {
  if (!navigator.share) {
    alert(`Sharing is unavailable.

Sharing is available in mobile browsers and only on HTTPS websites. ${
      location.protocol === "https:"
        ? "Use a mobile device or the Copy button instead."
        : `Open https://${location.host}${location.pathname}${location.search} instead.`
    }`)
    return
  }
  try {
    await navigator.share({ text })
  } catch {
    // Do nothing in case of a share abort
  }
}

function startPlayground(): void {
  resultDiv.innerHTML = ""
  const startTime = Date.now()

  try {
    const result = analyze("debug")
    const totalTime = Date.now() - startTime
    resultDiv.innerHTML = ""
    addSection("Time took to analyze:", `${totalTime}ms`)
    render(result)
    initializeDebugButtons(resultPublicText(result))
    console.log(result)
  } catch (error) {
    const totalTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    resultDiv.innerHTML = ""
    addSection("Unexpected error:", errorMessage)
    addSection("Time passed before the error:", `${totalTime}ms`)
    addSection("User agent:", navigator.userAgent)
    initializeDebugButtons(errorDebugText(errorMessage, totalTime))
    throw error
  }
}

startPlayground()