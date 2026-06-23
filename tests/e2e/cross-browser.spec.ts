import { test, expect, type Page, type ConsoleMessage } from "@playwright/test"

interface BrowserResult {
  ok: boolean
  visitor?: string
  riskScore?: number
  riskLevel?: string
  confidence?: number
  visitorId?: string
  referrer?: string
  componentCount?: number
  integrityCodes?: (string | number)[]
  errors?: number[]
  warnings?: string[]
  error?: string
  stack?: string
}

interface BrowserReport {
  name: string
  result: BrowserResult
  consoleLogs: string[]
  consoleWarnings: string[]
  consoleErrors: string[]
}

const reports: BrowserReport[] = []

function captureConsole(page: Page): {
  logs: string[]
  warnings: string[]
  errors: string[]
} {
  const logs: string[] = []
  const warnings: string[] = []
  const errors: string[] = []

  page.on("console", (msg: ConsoleMessage) => {
    const text = msg.text()
    if (msg.type() === "warn") warnings.push(text)
    else if (msg.type() === "error") errors.push(text)
    else logs.push(text)
  })

  page.on("pageerror", (err: Error) => {
    errors.push(`pageerror: ${err.message}`)
  })

  return { logs, warnings, errors }
}

test.describe.configure({ mode: "parallel" })

test("runs analyze and captures cross-browser output", async ({ page, browserName }) => {
  const { logs, warnings, errors } = captureConsole(page)

  await page.goto("/tests/e2e/fixture.html")
  await page.waitForFunction(() => (window as any).__crossBrowserResult?.ok !== undefined)

  const result: BrowserResult = await page.evaluate(() => (window as any).__crossBrowserResult)

  expect(result.ok).toBe(true)
  expect(result.visitor).toBeDefined()
  expect(["human", "suspicious", "bot"]).toContain(result.visitor!)
  expect(typeof result.riskScore).toBe("number")
  expect(typeof result.confidence).toBe("number")
  expect(result.visitorId).toBeTruthy()

  reports.push({
    name: browserName,
    result,
    consoleLogs: logs,
    consoleWarnings: warnings,
    consoleErrors: errors,
  })

  test.info().annotations.push(
    { type: "browser", description: browserName },
    { type: "visitor", description: result.visitor ?? "(none)" },
    { type: "riskScore", description: String(result.riskScore) },
    { type: "confidence", description: `${result.confidence}%` },
    { type: "warnings", description: warnings.join("; ") || "(none)" },
    { type: "errors", description: errors.join("; ") || "(none)" },
  )
})

test.afterAll(async () => {
  if (reports.length === 0) {
    console.log("\n  No cross-browser results collected.")
    return
  }

  const header = `\n  ${"Browser".padEnd(22)} │ ${"Visitor".padEnd(12)} │ ${"Risk".padEnd(6)} │ ${"Confidence".padEnd(10)} │ ${"Warnings".padEnd(8)} │ ${"Errors".padEnd(6)}`
  const sep = `  ${"─".repeat(22)}─┼─${"─".repeat(12)}─┼─${"─".repeat(6)}─┼─${"─".repeat(10)}─┼─${"─".repeat(8)}─┼─${"─".repeat(6)}`

  const rows = reports
    .map(
      (r) =>
        `  ${r.name.padEnd(22)} │ ${(r.result.visitor ?? "ERR").padEnd(12)} │ ${String(r.result.riskScore ?? "-").padEnd(6)} │ ${`${r.result.confidence ?? "-"}%`.padEnd(10)} │ ${String(r.consoleWarnings.length).padEnd(8)} │ ${String(r.consoleErrors.length).padEnd(6)}`,
    )
    .join("\n")

  console.log(`${header}\n${sep}\n${rows}\n`)
})
