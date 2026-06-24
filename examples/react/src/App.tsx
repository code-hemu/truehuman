import { useEffect, useState } from "react"
import { analyze, detector, type AnalyzeResult } from "truehuman"

type View = "public" | "debug"

function Badge({ visitor }: { visitor: string }) {
  const cls =
    visitor === "human" ? "badge badge-human"
    : visitor === "suspicious" ? "badge badge-suspicious"
    : "badge badge-bot"
  return <span className={cls}>{visitor.toUpperCase()}</span>
}

function fmtVal(v: unknown): string {
  if (v === undefined || v === null) return "\u2014"
  if (typeof v === "boolean") return String(v)
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return v
  if (Array.isArray(v)) return `[${v.length} items]`
  return JSON.stringify(v)
}

function fmtTitle(v: unknown): string {
  if (typeof v === "object" && v !== null && !Array.isArray(v))
    return Object.entries(v).map(([k, val]) => `${k}: ${fmtVal(val)}`).join(" | ")
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

function ComponentTable({ components }: { components: AnalyzeResult["components"] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Component</th><th>Duration</th><th>Value</th></tr>
        </thead>
        <tbody>
          {Object.entries(components).map(([name, entry]) => (
            <tr key={name}>
              <td><strong>{name}</strong></td>
              <td className="duration-cell">{entry.duration.toFixed(2)}ms</td>
              <td className="val-cell" title={fmtTitle(entry.value)}>{fmtVal(entry.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DebugPanel({ debug }: { debug: AnalyzeResult["debug"] }) {
  if (!debug) return null
  return (
    <details>
      <summary>Debug Info</summary>
      <div className="evidence">integrityCodes: [{debug.integrityCodes.join(", ")}]</div>
      <div className="evidence">iframeComparisons: {debug.iframeComparisons}</div>
      <div className="evidence">environmentFlag: {String(debug.environmentFlag)}</div>
      <div className="evidence">errors: [{debug.errors.join(", ")}]</div>
    </details>
  )
}

function ResultView({ result, mode }: { result: AnalyzeResult; mode: "public" | "debug" }) {
  return (
    <>
      <div className="verdict-row">
        <Badge visitor={result.visitor} />
        <span className="stat">Score: <strong>{result.risk.score}</strong></span>
        <span className="stat">Level: <strong>{result.risk.level}</strong></span>
        <span className="stat">Confidence: <strong>{result.confidence}%</strong></span>
      </div>

      <div className="section">
        <ComponentTable components={result.components} />
      </div>

      {mode === "debug" && result.debug && (
        <div className="section">
          <DebugPanel debug={result.debug} />
        </div>
      )}
    </>
  )
}

export default function App() {
  const [view, setView] = useState<View>("public")
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const mode = view === "debug" ? "debug" as const : "public" as const

    if (view === "public") {
      const res = analyze(mode)
      setResult(res)
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const res = await analyze({
          mode,
          plugins: [
            detector.grecaptcha({
              siteKey: "YOUR_SITE_KEY",
              action: "submit",
              endpoint: "https://your-backend.com/api/verify",
              threshold: 0.7,
            }),
          ],
        })
        setResult(res)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [view])

  return (
    <div className="app">
      <h1>TrueHuman</h1>
      <p>Client-side bot detection &mdash; React example</p>

      <div className="tabs">
        <button
          className={view === "public" ? "tab tab-active" : "tab"}
          onClick={() => setView("public")}
        >
          Public
        </button>
        <button
          className={view === "debug" ? "tab tab-active" : "tab"}
          onClick={() => setView("debug")}
        >
          Debug
        </button>
      </div>

      <div id="result">
        {loading && <p className="loading">Analyzing...</p>}
        {error && <pre className="error">Error: {error}</pre>}
        {result && <ResultView result={result} mode={view === "debug" ? "debug" : "public"} />}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 720px; margin: 0 auto; color: #1a1a2e; }
        h1 { font-size: 1.5rem; margin-bottom: .5rem; }
        p { color: #555; margin-bottom: 1.25rem; font-size: .875rem; }
        .tabs { display: flex; gap: .5rem; margin-bottom: 1.25rem; }
        .tab { padding: 6px 18px; border: 1px solid #d0d0d8; border-radius: 6px; background: #f4f4f8; cursor: pointer; font-size: .875rem; color: #555; }
        .tab-active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
        #result { background: #f4f4f8; padding: 1.25rem; border-radius: 10px; font-size: .875rem; }
        .loading { color: #888; font-style: italic; }
        .error { color: #991b1b; background: #fee2e2; padding: .75rem; border-radius: 6px; }
        .verdict-row { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; flex-wrap: wrap; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: .875rem; font-weight: 700; }
        .badge-human { background: #dcfce7; color: #166534; }
        .badge-suspicious { background: #fef9c3; color: #854d0e; }
        .badge-bot { background: #fee2e2; color: #991b1b; }
        .stat { font-size: .875rem; color: #555; }
        .stat strong { color: #1a1a2e; }
        .section { margin-top: .75rem; border-top: 1px solid #e0e0e8; padding-top: .75rem; }
        .table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #e0e0e8; }
        table { width: 100%; border-collapse: collapse; font-size: .8125rem; }
        thead { background: #eaeaef; }
        th { font-weight: 600; color: #444; text-transform: uppercase; letter-spacing: .04em; font-size: .6875rem; padding: 10px 12px; text-align: left; }
        td { padding: 8px 12px; border-top: 1px solid #e0e0e8; }
        tbody tr { transition: background .15s; }
        tbody tr:nth-child(even) { background: #f0f0f5; }
        tbody tr:hover { background: #e4e4ef; }
        .val-cell { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: .75rem; color: #444; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .duration-cell { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: .75rem; color: #666; text-align: right; white-space: nowrap; }
        details { margin-top: .5rem; }
        summary { cursor: pointer; font-weight: 600; color: #666; font-size: .8125rem; }
        .evidence { margin-left: 1.25rem; padding: .25rem 0 .25rem .75rem; border-left: 2px solid #ddd; font-size: .8rem; color: #555; }
      `}</style>
    </div>
  )
}
